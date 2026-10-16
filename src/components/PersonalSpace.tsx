import React, { useState } from "react";
import { AnalyzedMatch } from "../types";
import { UserCheck, Star, Trophy, Target, History, BookmarkCheck, Trash2 } from "lucide-react";
import { MatchCard } from "./MatchCard";

interface PersonalSpaceProps {
  matches: AnalyzedMatch[];
  onSelectMatch: (match: AnalyzedMatch) => void;
  favoriteTeams: string[];
  onToggleTeamFavorite: (team: string) => void;
  favoriteCompetitions: string[];
  onToggleCompFavorite: (comp: string) => void;
  favoriteMarkets: string[];
  onToggleMarketFavorite: (market: string) => void;
  analyzedHistory: AnalyzedMatch[];
  onClearHistory: () => void;
}

export const PersonalSpace: React.FC<PersonalSpaceProps> = ({
  matches,
  onSelectMatch,
  favoriteTeams,
  onToggleTeamFavorite,
  favoriteCompetitions,
  onToggleCompFavorite,
  favoriteMarkets,
  onToggleMarketFavorite,
  analyzedHistory,
  onClearHistory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"preferences" | "favoris" | "historique">("preferences");

  // Extract all available teams and competitions from loaded matches
  const allTeams = Array.from(
    new Set(matches.flatMap(m => [m.match.strHomeTeam, m.match.strAwayTeam]))
  );
  const allCompetitions = Array.from(
    new Set(matches.map(m => m.match.strLeague || m.competition.label))
  );

  const availableMarkets = [
    { id: "1N2", label: "1N2 (Vainqueur)" },
    { id: "DOUBLE_CHANCE", label: "Double Chance" },
    { id: "BTTS", label: "Les deux équipes marquent (BTTS)" },
    { id: "OVER25", label: "Plus de 2.5 Buts" },
  ];

  // Filter matches based on user preferences
  const filteredByPreferences = matches.filter(m => {
    const teamMatch =
      favoriteTeams.length === 0 ||
      favoriteTeams.includes(m.match.strHomeTeam) ||
      favoriteTeams.includes(m.match.strAwayTeam);

    const compMatch =
      favoriteCompetitions.length === 0 ||
      favoriteCompetitions.includes(m.match.strLeague || m.competition.label);

    return teamMatch && compMatch;
  });

  return (
    <div className="rubric-view">
      <div className="rubric-view-header">
        <h2><UserCheck size={24} /> Espace Personnel & Préférences</h2>
        <p>Personnalisez vos équipes, compétitions et marchés favoris. Aucune donnée personnelle n'est collectée (stockage local sécurisé).</p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="filter-tabs" style={{ marginBottom: '25px' }}>
        <button
          className={`filter-tab ${activeSubTab === "preferences" ? "active" : ""}`}
          onClick={() => setActiveSubTab("preferences")}
        >
          <BookmarkCheck size={16} /> Gestion des Préférences
        </button>
        <button
          className={`filter-tab ${activeSubTab === "favoris" ? "active" : ""}`}
          onClick={() => setActiveSubTab("favoris")}
        >
          <Star size={16} /> Matchs Filtrés par Préférences ({filteredByPreferences.length})
        </button>
        <button
          className={`filter-tab ${activeSubTab === "historique" ? "active" : ""}`}
          onClick={() => setActiveSubTab("historique")}
        >
          <History size={16} /> Historique des Analyses ({analyzedHistory.length})
        </button>
      </div>

      {activeSubTab === "preferences" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Favorite Teams */}
          <div className="stat-card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} /> Équipes Favorites
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>Sélectionnez vos équipes pour filtrer instantanément l'affichage.</p>
            {allTeams.length === 0 ? (
              <div className="message" style={{ padding: '10px', fontSize: '12px' }}>Aucune équipe disponible actuellement.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {allTeams.map(team => {
                  const isFav = favoriteTeams.includes(team);
                  return (
                    <button
                      key={team}
                      onClick={() => onToggleTeamFavorite(team)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--line)',
                        background: isFav ? 'linear-gradient(135deg, #1683d8, #0ea5e9)' : 'var(--panel)',
                        color: isFav ? 'white' : 'var(--text-soft)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {team} {isFav ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Favorite Competitions */}
          <div className="stat-card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} /> Compétitions Favorites
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>Filtrez les tournois et ligues qui vous intéressent.</p>
            {allCompetitions.length === 0 ? (
              <div className="message" style={{ padding: '10px', fontSize: '12px' }}>Aucune compétition disponible.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {allCompetitions.map(comp => {
                  const isFav = favoriteCompetitions.includes(comp);
                  return (
                    <button
                      key={comp}
                      onClick={() => onToggleCompFavorite(comp)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: '1px solid var(--line)',
                        background: isFav ? 'linear-gradient(135deg, #1683d8, #0ea5e9)' : 'var(--panel)',
                        color: isFav ? 'white' : 'var(--text-soft)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {comp} {isFav ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Favorite Markets */}
          <div className="stat-card" style={{ padding: '20px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} /> Marchés de Pronostics Favoris
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>Définissez vos types de paris privilégiés.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableMarkets.map(m => {
                const isFav = favoriteMarkets.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => onToggleMarketFavorite(m.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--line)',
                      background: isFav ? 'linear-gradient(135deg, #1683d8, #0ea5e9)' : 'var(--panel)',
                      color: isFav ? 'white' : 'var(--text-soft)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {m.label} {isFav ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === "favoris" && (
        <>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Affichage filtré selon vos équipes ({favoriteTeams.length}) et compétitions ({favoriteCompetitions.length}) favorites :
          </p>
          {filteredByPreferences.length === 0 ? (
            <div className="message">Aucun match ne correspond à vos préférences actuelles. Sélectionnez des favoris dans l'onglet "Gestion des Préférences".</div>
          ) : (
            <section className="prediction-grid">
              {filteredByPreferences.map(item => (
                <MatchCard key={item.match.idEvent} item={item} onSelect={onSelectMatch} />
              ))}
            </section>
          )}
        </>
      )}

      {activeSubTab === "historique" && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Matchs dont vous avez consulté l'analyse détaillée au cours de votre session :
            </p>
            {analyzedHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(212, 175, 184, 0.15)', color: 'var(--danger)', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}
              >
                <Trash2 size={14} /> Vider l'historique
              </button>
            )}
          </div>

          {analyzedHistory.length === 0 ? (
            <div className="message">Aucun historique d'analyse pour l'instant. Cliquez sur "Voir l'analyse détaillée" sur n'importe quel match pour l'enregistrer ici.</div>
          ) : (
            <section className="prediction-grid">
              {analyzedHistory.map((item, idx) => (
                <MatchCard key={`${item.match.idEvent}-${idx}`} item={item} onSelect={onSelectMatch} />
              ))}
            </section>
          )}
        </div>
      )}

    </div>
  );
};
