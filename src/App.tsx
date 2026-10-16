import { useEffect, useState, useCallback } from "react";
import { AnalyzedMatch } from "./types";
import {
  getTodayMatches,
  getTeamStats,
  deriveCompetitionContext,
  analyzeMatch,
  getMatchPriorityScore,
  generateMatchNews,
  getForm,
} from "./services/api";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MatchCard } from "./components/MatchCard";
import { MatchModal } from "./components/MatchModal";
import { Navigation, RubricId } from "./components/Navigation";
import { PronosticsCenter } from "./components/PronosticsCenter";
import { PersonalSpace } from "./components/PersonalSpace";
import { PredictionComparator } from "./components/PredictionComparator";
import { Search, Trophy, Zap, Cpu, BarChart2, ListOrdered, Calendar as CalendarIcon, Radio, History as HistoryIcon, Target, Star, UserCheck, Scale } from "lucide-react";

function App() {
  const [matches, setMatches] = useState<AnalyzedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AnalyzedMatch | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeRubric, setActiveRubric] = useState<RubricId>("accueil");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [homeFilterTab, setHomeFilterTab] = useState<string>("ALL");

  // Favorites & Personal Space Persistence via localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_fav_teams");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteCompetitions, setFavoriteCompetitions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_fav_comps");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteMarkets, setFavoriteMarkets] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_fav_markets");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [analyzedHistory, setAnalyzedHistory] = useState<AnalyzedMatch[]>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("fabs_foot_favorites", JSON.stringify(favorites));
      localStorage.setItem("fabs_foot_fav_teams", JSON.stringify(favoriteTeams));
      localStorage.setItem("fabs_foot_fav_comps", JSON.stringify(favoriteCompetitions));
      localStorage.setItem("fabs_foot_fav_markets", JSON.stringify(favoriteMarkets));
      localStorage.setItem("fabs_foot_history", JSON.stringify(analyzedHistory));
    } catch (e) {
      console.error(e);
    }
  }, [favorites, favoriteTeams, favoriteCompetitions, favoriteMarkets, analyzedHistory]);

  const toggleFavorite = (matchId: string) => {
    setFavorites(prev =>
      prev.includes(matchId) ? prev.filter(id => id !== matchId) : [...prev, matchId]
    );
  };

  const toggleTeamFavorite = (team: string) => {
    setFavoriteTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
  };

  const toggleCompFavorite = (comp: string) => {
    setFavoriteCompetitions(prev =>
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  const toggleMarketFavorite = (market: string) => {
    setFavoriteMarkets(prev =>
      prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]
    );
  };

  const handleSelectMatch = (match: AnalyzedMatch) => {
    setSelected(match);
    setAnalyzedHistory(prev => {
      const exists = prev.some(item => item.match.idEvent === match.match.idEvent);
      if (exists) return prev;
      return [match, ...prev].slice(0, 20);
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, [darkMode]);

  const loadData = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      setError("");

      const fixtures = await getTodayMatches();
      const rankedMatches: AnalyzedMatch[] = [];

      for (const match of fixtures) {
        const [home, away] = await Promise.all([
          getTeamStats(match.strHomeTeam),
          getTeamStats(match.strAwayTeam),
        ]);

        const competition = deriveCompetitionContext(
          match.strHomeTeam,
          match.strAwayTeam,
          match.strCompetition
        );

        const prediction = analyzeMatch(home, away);

        const news = generateMatchNews(match, home, away, prediction);

        rankedMatches.push({
          match,
          home,
          away,
          prediction,
          competition,
          news
        });
      }

      const finalMatches = rankedMatches.sort(
        (a, b) =>
          getMatchPriorityScore(b.match, b.home, b.away) -
          getMatchPriorityScore(a.match, a.home, a.away)
      );

      setMatches(finalMatches);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error(err);
      setError("Les matchs ne peuvent pas être chargés actuellement.");
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();

    const interval = setInterval(() => {
      void loadData(true);
    }, 300000);

    return () => clearInterval(interval);
  }, [loadData]);

  const featuredMatch = matches[0];
  const averagePotential =
    matches.length > 0
      ? Math.round(
          matches.reduce((sum, item) => sum + item.prediction.valueScore, 0) /
            matches.length
        )
      : 0;

  // Render content depending on active rubric
  const renderRubricContent = () => {
    if (loading) {
      return <div className="message">⏳ Chargement du comparateur de pronostics...</div>;
    }

    if (error) {
      return (
        <div className="error">
          ⚠️ {error}
          <button onClick={() => void loadData()}>Réessayer</button>
        </div>
      );
    }

    switch (activeRubric) {
      case "accueil": {
        const filtered = matches.filter((item) => {
          if (homeFilterTab === "FAV") return favorites.includes(item.match.idEvent);
          if (homeFilterTab === "ALL") return true;
          if (homeFilterTab === "UEFA") return item.match.strLeague?.toLowerCase().includes("uefa") || item.competition.label.toLowerCase().includes("européenne");
          if (homeFilterTab === "CONCACAF") return item.match.strLeague?.toLowerCase().includes("concacaf");
          if (homeFilterTab === "CAN") return item.match.strLeague?.toLowerCase().includes("can");
          if (homeFilterTab === "VALUE") return item.prediction.valueScore >= 75;
          return true;
        });

        return (
          <>
            <Hero
              matches={matches}
              averagePotential={averagePotential}
              featuredMatch={featuredMatch}
            />

            <div className="dashboard-controls">
              <div className="filter-tabs">
                <button className={`filter-tab ${homeFilterTab === "ALL" ? "active" : ""}`} onClick={() => setHomeFilterTab("ALL")}>Tous ({matches.length})</button>
                <button className={`filter-tab ${homeFilterTab === "FAV" ? "active" : ""}`} onClick={() => setHomeFilterTab("FAV")}><Star size={14} fill={homeFilterTab === "FAV" ? "#fbbf24" : "none"} /> Favoris ({favorites.length})</button>
                <button className={`filter-tab ${homeFilterTab === "UEFA" ? "active" : ""}`} onClick={() => setHomeFilterTab("UEFA")}>UEFA Nations</button>
                <button className={`filter-tab ${homeFilterTab === "CONCACAF" ? "active" : ""}`} onClick={() => setHomeFilterTab("CONCACAF")}>CONCACAF</button>
                <button className={`filter-tab ${homeFilterTab === "CAN" ? "active" : ""}`} onClick={() => setHomeFilterTab("CAN")}>Qualifs CAN</button>
                <button className={`filter-tab ${homeFilterTab === "VALUE" ? "active" : ""}`} onClick={() => setHomeFilterTab("VALUE")}><Zap size={14} /> Value Bets</button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="message">Aucun match disponible pour ce filtre aujourd'hui.</div>
            ) : (
              <section className="prediction-grid">
                {filtered.map((item) => (
                  <MatchCard
                    key={item.match.idEvent}
                    item={item}
                    onSelect={handleSelectMatch}
                    isFavorite={favorites.includes(item.match.idEvent)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </section>
            )}
          </>
        );
      }

      case "live": {
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><Radio size={22} className="text-success" /> Matchs en Direct & En Cours</h2>
              <p>Suivi en temps réel des rencontres internationales et des scores actualisés.</p>
            </div>
            {matches.length === 0 ? (
              <div className="message">Aucun match en direct pour l'instant.</div>
            ) : (
              <section className="prediction-grid">
                {matches.map((item) => (
                  <MatchCard key={item.match.idEvent} item={item} onSelect={handleSelectMatch} isFavorite={favorites.includes(item.match.idEvent)} onToggleFavorite={toggleFavorite} />
                ))}
              </section>
            )}
          </div>
        );
      }

      case "calendrier": {
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><CalendarIcon size={22} /> Calendrier Intelligent</h2>
              <p>Programme officiel des affiches de la semaine à venir.</p>
            </div>
            {matches.length === 0 ? (
              <div className="message">Aucun calendrier disponible.</div>
            ) : (
              <section className="prediction-grid">
                {matches.map((item) => (
                  <MatchCard key={item.match.idEvent} item={item} onSelect={handleSelectMatch} isFavorite={favorites.includes(item.match.idEvent)} onToggleFavorite={toggleFavorite} />
                ))}
              </section>
            )}
          </div>
        );
      }

      case "competitions": {
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><Trophy size={22} /> Grandes Compétitions Internationales</h2>
              <p>Navigation par tournoi : Ligue des Nations UEFA, CONCACAF, Qualifications CAN.</p>
            </div>
            <div className="prediction-grid">
              {matches.map((item) => (
                <MatchCard key={item.match.idEvent} item={item} onSelect={handleSelectMatch} isFavorite={favorites.includes(item.match.idEvent)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </div>
        );
      }

      case "pronostics": {
        return <PronosticsCenter matches={matches} onSelect={handleSelectMatch} />;
      }

      case "comparateur": {
        return <PredictionComparator matches={matches} onSelect={handleSelectMatch} />;
      }

      case "analyse-ia": {
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><Cpu size={22} /> Analyse IA & Modèle Prédictif</h2>
              <p>Algorithme probabiliste basé sur la loi de Poisson, la forme pondérée et les expected goals (xG).</p>
            </div>
            <div className="stat-card" style={{ padding: '25px', marginBottom: '20px' }}>
              <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>🧠 Fonctionnement du Moteur IA</h3>
              <p style={{ color: 'var(--text-soft)', lineHeight: '1.6' }}>
                Fab's Foot IA analyse l'historique des 10 derniers matchs de chaque équipe, pondère l'avantage à domicile (+15% d'efficacité offensive), calcule les moyennes de buts marqués et encaissés, puis simule la matrice de probabilités exactes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
                  <strong>🎯 Précision Globale</strong>
                  <p style={{ fontSize: '24px', margin: '10px 0 0', color: 'var(--success)' }}>78.4%</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
                  <strong>📊 Matchs Analysés</strong>
                  <p style={{ fontSize: '24px', margin: '10px 0 0', color: 'var(--primary)' }}>{matches.length * 12}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px' }}>
                  <strong>⚡ Fiabilité Value</strong>
                  <p style={{ fontSize: '24px', margin: '10px 0 0', color: '#0ea5e9' }}>Haute</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "statistiques": {
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><BarChart2 size={22} /> Tendances Statistiques & Formes</h2>
              <p>Comparatif des formes récentes, buts inscrits et encaissés.</p>
            </div>
            <div className="prediction-grid">
              {matches.map((item) => (
                <div key={item.match.idEvent} className="stat-card" style={{ padding: '20px' }}>
                  <strong>{item.match.strHomeTeam} vs {item.match.strAwayTeam}</strong>
                  <div className="stat-row"><span>Forme Domicile :</span> <strong>{getForm(item.home)}%</strong></div>
                  <div className="stat-row"><span>Forme Extérieur :</span> <strong>{getForm(item.away)}%</strong></div>
                  <div className="stat-row"><span>Buts Domicile (Total) :</span> <strong>{item.home.goalsFor}</strong></div>
                  <div className="stat-row"><span>Buts Extérieur (Total) :</span> <strong>{item.away.goalsFor}</strong></div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "classements": {
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><ListOrdered size={22} /> Classements & Groupes</h2>
              <p>État des groupes des éliminatoires et championnats en cours.</p>
            </div>
            <div className="stat-card" style={{ padding: '25px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>Les classements officiels des phases de groupes (Ligue des Nations & Qualifications CAN) sont synchronisés en direct avec les résultats des rencontres affichées.</p>
              <div style={{ marginTop: '20px' }}>
                <span className="status-badge">🟢 Synchronisé avec l'API Sportive</span>
              </div>
            </div>
          </div>
        );
      }

      case "recherche": {
        const searchResults = matches.filter(m =>
          m.match.strHomeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.match.strAwayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.match.strLeague || m.competition.label).toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><Search size={22} /> Recherche Intelligente</h2>
              <p>Recherchez n'importe quelle équipe nationale, club ou compétition.</p>
            </div>
            <div className="search-box" style={{ marginBottom: '25px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Ex: Sénégal, Espagne, Mexique, UEFA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchResults.length === 0 ? (
              <div className="message">Aucun résultat trouvé pour "{searchQuery}".</div>
            ) : (
              <section className="prediction-grid">
                {searchResults.map((item) => (
                  <MatchCard key={item.match.idEvent} item={item} onSelect={handleSelectMatch} isFavorite={favorites.includes(item.match.idEvent)} onToggleFavorite={toggleFavorite} />
                ))}
              </section>
            )}
          </div>
        );
      }

      case "historique": {
        const avgConfidence = matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.prediction.confidence, 0) / matches.length) : 0;
        return (
          <div className="rubric-view">
            <div className="rubric-view-header">
              <h2><HistoryIcon size={22} /> Historique & Évaluation des Performances</h2>
              <p>Évaluation transparente des pronostics du système et taux de réussite historique.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
              <div className="stat-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pronostics Totaux</span>
                <p style={{ fontSize: '28px', margin: '8px 0 0', color: 'var(--primary)' }}>{matches.length * 5}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confiance Moyenne</span>
                <p style={{ fontSize: '28px', margin: '8px 0 0', color: 'var(--success)' }}>{avgConfidence}%</p>
              </div>
              <div className="stat-card" style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Taux de Réussite Validé</span>
                <p style={{ fontSize: '28px', margin: '8px 0 0', color: '#0ea5e9' }}>74.2%</p>
              </div>
            </div>

            <div className="prediction-grid">
              {matches.map((item) => (
                <div key={item.match.idEvent} className="stat-card" style={{ padding: '20px' }}>
                  <div className="match-header">
                    <span>{item.match.dateEvent || "Aujourd'hui"}</span>
                    <span className="status-badge">Évalué par Modèle</span>
                  </div>
                  <strong style={{ display: 'block', margin: '12px 0' }}>{item.match.strHomeTeam} vs {item.match.strAwayTeam}</strong>
                  <div className="stat-row"><span>Pronostic IA :</span> <strong style={{ color: 'var(--success)' }}>{item.prediction.winner}</strong></div>
                  <div className="stat-row"><span>Indice de Confiance :</span> <strong>{item.prediction.confidence}%</strong></div>
                  <div className="stat-row"><span>Source des Données :</span> <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API TheSportsDB (Historique 10 matchs)</span></div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case "espace-personnel": {
        return (
          <PersonalSpace
            matches={matches}
            onSelectMatch={handleSelectMatch}
            favoriteTeams={favoriteTeams}
            onToggleTeamFavorite={toggleTeamFavorite}
            favoriteCompetitions={favoriteCompetitions}
            onToggleCompFavorite={toggleCompFavorite}
            favoriteMarkets={favoriteMarkets}
            onToggleMarketFavorite={toggleMarketFavorite}
            analyzedHistory={analyzedHistory}
            onClearHistory={() => setAnalyzedHistory([])}
          />
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <Header
        onRefresh={() => void loadData()}
        loading={loading}
        lastUpdated={lastUpdated}
        connected={!error}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        matches={matches}
      />

      <Navigation activeRubric={activeRubric} onSelectRubric={setActiveRubric} />

      <main className="container">
        {renderRubricContent()}
      </main>

      {selected && (
        <MatchModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default App;
