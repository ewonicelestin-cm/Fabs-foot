import { useEffect, useState, useCallback } from "react";
import { AnalyzedMatch } from "./types";
import {
  getTodayMatches,
  getTeamStats,
  deriveCompetitionContext,
  analyzeMatch,
  getMatchPriorityScore,
  generateMatchNews,
} from "./services/api";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { MatchCard } from "./components/MatchCard";
import { MatchModal } from "./components/MatchModal";

function App() {
  const [matches, setMatches] = useState<AnalyzedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AnalyzedMatch | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

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

    // Automatic check every 5 minutes (300,000 ms)
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

  return (
    <div className="app">
      <Header
        onRefresh={() => void loadData()}
        loading={loading}
        lastUpdated={lastUpdated}
        connected={!error}
      />

      <main className="container">
        <Hero
          matches={matches}
          averagePotential={averagePotential}
          featuredMatch={featuredMatch}
        />

        {error && (
          <div className="error">
            ⚠️ {error}
            <button onClick={() => void loadData()}>Réessayer</button>
          </div>
        )}

        {loading && (
          <div className="message">⏳ Récupération et analyse des matchs...</div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="message">Aucun match disponible aujourd'hui.</div>
        )}

        <section className="prediction-grid">
          {matches.map((item) => (
            <MatchCard
              key={item.match.idEvent}
              item={item}
              onSelect={setSelected}
            />
          ))}
        </section>
      </main>

      {selected && (
        <MatchModal selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default App;
