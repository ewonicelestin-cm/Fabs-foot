import React, { useEffect, useState } from "react";
import { AnalyzedMatch } from "../types";
import { ExternalLink, Scale, ShieldCheck } from "lucide-react";
import { getMatchStatusLabel } from "../services/matchStatus";

interface PredictionComparatorProps {
  matches: AnalyzedMatch[];
  onSelect: (item: AnalyzedMatch) => void;
  lastUpdated: string;
}

type ExpertPick = "" | "Domicile" | "Nul" | "Extérieur";

const AI_FALLBACK_VALUE = "__ai_fallback__";

const expertSources = [
  {
    id: "football-whispers",
    name: "Football Whispers",
    description: "Conseils et analyses publiés par leurs experts",
    url: "https://footballwhispers.com/blog/todays-betting-tips/",
  },
  {
    id: "footballpredictions",
    name: "FootballPredictions.NET",
    description: "Prédictions quotidiennes et analyses statistiques",
    url: "https://footballpredictions.net/",
  },
  {
    id: "forebet",
    name: "Forebet",
    description: "Prévisions statistiques par match et compétition",
    url: "https://www.forebet.com/en/football-tips-and-predictions-for-today",
  },
  {
    id: "predictz",
    name: "PredictZ",
    description: "Pronostics quotidiens par championnat",
    url: "https://www.predictz.com/predictions/",
  },
];

export const PredictionComparator: React.FC<PredictionComparatorProps> = ({
  matches,
  onSelect,
  lastUpdated,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.match.idEvent || "");
  const [expertPicks, setExpertPicks] = useState<Record<string, Record<string, ExpertPick>>>(() => {
    try {
      const saved = localStorage.getItem("fabs_foot_expert_picks");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Impossible de lire les sélections d’experts enregistrées.", error);
      return {};
    }
  });

  useEffect(() => {
    if (!matches.some((item) => item.match.idEvent === selectedMatchId)) {
      setSelectedMatchId(matches[0]?.match.idEvent || "");
    }
  }, [matches, selectedMatchId]);

  useEffect(() => {
    try {
      localStorage.setItem("fabs_foot_expert_picks", JSON.stringify(expertPicks));
    } catch (error) {
      console.error("Impossible d’enregistrer les sélections d’experts.", error);
    }
  }, [expertPicks]);

  const currentMatch = matches.find((item) => item.match.idEvent === selectedMatchId);
  const hasVerifiedStats = currentMatch?.prediction.dataBasis === "verified";

  return (
    <div className="rubric-view">
      <div className="rubric-view-header">
        <h2><Scale size={24} /> Comparateur des sources de pronostics</h2>
        <p>Consultez l’analyse IA Fab’s Foot et les publications récentes de sites d’experts, sans cotes.</p>
      </div>

      <div className="source-transparency" role="note">
        <ShieldCheck size={19} />
        <span>
          Les sélections tierces restent hébergées par leurs éditeurs et ne sont pas importées automatiquement.
          Chaque source affiche un choix IA de secours jusqu’à ce que vous releviez manuellement son pronostic 1N2.
          Le secours n’est jamais attribué au site ; les choix saisis restent dans ce navigateur.
          Données du modèle mises à jour : {lastUpdated || "date indisponible"}.
        </span>
      </div>

      {matches.length > 0 && (
        <div className="prediction-match-select">
          <label htmlFor="prediction-match">Match à analyser</label>
          <select
            id="prediction-match"
            value={currentMatch?.match.idEvent || ""}
            onChange={(event) => setSelectedMatchId(event.target.value)}
          >
            {matches.map((item) => (
              <option key={item.match.idEvent} value={item.match.idEvent}>
                {item.match.strHomeTeam} vs {item.match.strAwayTeam} ({item.match.strLeague || item.competition.label})
              </option>
            ))}
          </select>
        </div>
      )}

      {currentMatch ? (
        <>
          <section className="expert-comparison">
            <article className="expert-source-card ai-source-card">
              <div className="expert-source-heading">
                <span className="status-badge">FAB’S FOOT · IA</span>
                <span className="expert-updated">{currentMatch.match.strTime || "Horaire à confirmer"}</span>
              </div>
              <h3>{currentMatch.match.strHomeTeam} <span>vs</span> {currentMatch.match.strAwayTeam}</h3>
              <p className="expert-competition">
                {currentMatch.match.strLeague || currentMatch.competition.label} · {getMatchStatusLabel(currentMatch.match)}
              </p>
              {currentMatch.prediction.probabilities && (
                <>
                  <div className="ai-pick">
                    <span>{hasVerifiedStats ? "Pronostic IA · historique vérifié" : "Pronostic IA de secours · historique insuffisant"}</span>
                    <strong>{currentMatch.prediction.winner}</strong>
                    <span>{currentMatch.prediction.confidence}% estimation · Score indicatif {currentMatch.prediction.score}</span>
                  </div>
                  <div className="probability-row" aria-label="Probabilités IA">
                    {[
                      ["Domicile", currentMatch.prediction.probabilities.home],
                      ["Nul", currentMatch.prediction.probabilities.draw],
                      ["Extérieur", currentMatch.prediction.probabilities.away],
                    ].map(([label, probability]) => (
                      <div key={label} className="probability-item">
                        <span>{label}</span>
                        <strong>{probability}%</strong>
                      </div>
                    ))}
                  </div>
                  {currentMatch.prediction.metricProjections && (
                    <div className="ai-metric-summary">
                      <strong>Projections IA — données non live</strong>
                      <span>Tirs cadrés : {currentMatch.prediction.metricProjections.shotsOnTarget.home}–{currentMatch.prediction.metricProjections.shotsOnTarget.away} · total {currentMatch.prediction.metricProjections.shotsOnTarget.rangeMin}–{currentMatch.prediction.metricProjections.shotsOnTarget.rangeMax}</span>
                      <span>Corners : {currentMatch.prediction.metricProjections.corners.home}–{currentMatch.prediction.metricProjections.corners.away} · total {currentMatch.prediction.metricProjections.corners.rangeMin}–{currentMatch.prediction.metricProjections.corners.rangeMax}</span>
                    </div>
                  )}
                  <button className="details" onClick={() => onSelect(currentMatch)}>
                    Voir l’analyse IA détaillée
                  </button>
                </>
              )}
            </article>

            {expertSources.map((source) => {
              const expertPick = expertPicks[currentMatch.match.idEvent]?.[source.id] || "";
              const comparisonPick = expertPick || currentMatch.prediction.winner;
              const agreesWithAi = comparisonPick === currentMatch.prediction.winner;
              return (
              <article className="expert-source-card external-source-card" key={source.name}>
                <div className="expert-source-heading">
                  <span className="source-type">SOURCE EXTERNE</span>
                  <ExternalLink size={17} aria-hidden="true" />
                </div>
                <h3>{source.name}</h3>
                <p>{source.description}</p>
                <p className="source-notice">
                  {expertPick
                    ? "Sélection 1N2 enregistrée manuellement pour cette source."
                    : `Estimation IA de secours : ${currentMatch.prediction.winner}. Ce n’est pas le pronostic du site.`}
                </p>
                <label className="expert-pick-label">
                  Pronostic comparé
                  <select
                    value={expertPick || AI_FALLBACK_VALUE}
                    onChange={(event) => {
                      const pick = event.currentTarget.value;
                      if (pick === AI_FALLBACK_VALUE) {
                        setExpertPicks((previous) => {
                          const nextMatchPicks = { ...previous[currentMatch.match.idEvent] };
                          delete nextMatchPicks[source.id];
                          return { ...previous, [currentMatch.match.idEvent]: nextMatchPicks };
                        });
                        return;
                      }
                      if (pick !== "Domicile" && pick !== "Nul" && pick !== "Extérieur") return;
                      setExpertPicks((previous) => ({
                        ...previous,
                        [currentMatch.match.idEvent]: {
                          ...previous[currentMatch.match.idEvent],
                          [source.id]: pick,
                        },
                      }));
                    }}
                  >
                    <option value={AI_FALLBACK_VALUE}>Estimation IA de secours (pas le choix du site)</option>
                    <option value="Domicile">Victoire domicile</option>
                    <option value="Nul">Match nul</option>
                    <option value="Extérieur">Victoire extérieur</option>
                  </select>
                </label>
                <p className={`expert-alignment ${agreesWithAi ? "agrees" : "differs"}`}>
                  {expertPick
                    ? agreesWithAi
                      ? "Même choix que l’IA"
                      : "Choix différent de l’IA"
                    : "Estimation IA de secours · non confirmée par le site"}
                </p>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  Consulter les pronostics du site <ExternalLink size={14} />
                </a>
              </article>
            );})}
          </section>
          <p className="source-disclaimer">
            Les sources externes peuvent ne pas couvrir cette rencontre. Les liens ouvrent leurs pages de pronostics
            quotidiennes ; aucune sélection n’est attribuée à ces sites sans vérification sur leur page.
          </p>
        </>
      ) : (
        <div className="message">Aucun match n’est disponible pour l’instant.</div>
      )}
    </div>
  );
};
