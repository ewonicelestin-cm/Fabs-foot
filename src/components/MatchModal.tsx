import React from "react";
import { AnalyzedMatch } from "../types";
import { AlertCircle, Users, Activity, Newspaper } from "lucide-react";
import { getFlagUrl } from "../services/api";

interface MatchModalProps {
  selected: AnalyzedMatch;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  selected,
  onClose,
}) => {
  const flag = getFlagUrl(selected.match.strCountry);

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header-main">
          <h2>Analyse du match</h2>
          <span className="status-badge">{selected.match.strStatus || "Programmé"}</span>
        </div>

        <h3>
          {selected.match.strHomeTeam} VS {selected.match.strAwayTeam}
        </h3>

        <div className="competition-chip detail-competition">
          <div className="competition-info">
            {flag && <img src={flag} alt="" className="country-flag" />}
            <strong>{selected.match.strLeague || selected.competition.label}</strong>
          </div>
          <span>Niveau d’enjeu : {selected.competition.importance}/100</span>
        </div>

        <p className="competition-insight textual">
          {selected.competition.amplitude} — {selected.competition.insight}
        </p>

        <div className="modal-sections">
          <section className="modal-section">
            <div className="section-title">
              <Activity size={18} />
              <h4>Étude des Buts Probables (Expertise IA)</h4>
            </div>

            <div className="goals-study-grid">
              <div className="study-rubric">
                <div className="rubric-header">Rubrique I : 1ère Mi-temps (1H)</div>
                <div className="stat-row"><span>+0.5 but en 1H :</span> <strong>{selected.prediction.halfTimeStudy?.probOver05}%</strong></div>
                <div className="stat-row"><span>+1.5 buts en 1H :</span> <strong>{selected.prediction.halfTimeStudy?.probOver15}%</strong></div>
                <div className="stat-row"><span>Score HT probable :</span> <strong>{selected.prediction.halfTimeStudy?.likelyScore}</strong></div>
              </div>

              <div className="study-rubric">
                <div className="rubric-header">Rubrique II : 2ème Mi-temps (2H)</div>
                <div className="stat-row"><span>Intensité offensive :</span> <strong>{selected.prediction.secondHalfStudy?.intensity}</strong></div>
                <div className="stat-row"><span>Probabilité but en 2H :</span> <strong>{selected.prediction.secondHalfStudy?.probGoals}%</strong></div>
              </div>
            </div>

            <div className="verdict-bar">
               <span>Verdict Volume : </span>
               <strong>{selected.prediction.over25 === "Oui" ? "MATCH OUVERT (+2.5)" : "MATCH FERMÉ (-2.5)"}</strong>
            </div>
          </section>

          <section className="modal-section">
            <div className="section-title">
              <Activity size={18} />
              <h4>Statistiques Historiques (10 derniers matchs)</h4>
            </div>
            <div className="detail-grid">
              {selected.home.played > 0 ? (
                <div className="stat-card">
                  <strong>{selected.match.strHomeTeam}</strong>
                  <div className="stat-row"><span>Matchs :</span> <span>{selected.home.played}</span></div>
                  <div className="stat-row"><span>Victoires :</span> <span>{selected.home.wins}</span></div>
                  <div className="stat-row"><span>Nuls :</span> <span>{selected.home.draws}</span></div>
                  <div className="stat-row"><span>Défaites :</span> <span>{selected.home.losses}</span></div>
                  <div className="stat-row"><span>Buts :</span> <span>{selected.home.goalsFor} : {selected.home.goalsAgainst}</span></div>
                </div>
              ) : (
                <div className="stat-card empty"><strong>{selected.match.strHomeTeam}</strong><p>Pas de données disponibles</p></div>
              )}

              {selected.away.played > 0 ? (
                <div className="stat-card">
                  <strong>{selected.match.strAwayTeam}</strong>
                  <div className="stat-row"><span>Matchs :</span> <span>{selected.away.played}</span></div>
                  <div className="stat-row"><span>Victoires :</span> <span>{selected.away.wins}</span></div>
                  <div className="stat-row"><span>Nuls :</span> <span>{selected.away.draws}</span></div>
                  <div className="stat-row"><span>Défaites :</span> <span>{selected.away.losses}</span></div>
                  <div className="stat-row"><span>Buts :</span> <span>{selected.away.goalsFor} : {selected.away.goalsAgainst}</span></div>
                </div>
              ) : (
                <div className="stat-card empty"><strong>{selected.match.strAwayTeam}</strong><p>Pas de données disponibles</p></div>
              )}
            </div>
          </section>

          <section className="modal-section">
            <div className="section-title">
              <AlertCircle size={18} />
              <h4>Statistiques en Direct & Avancées</h4>
            </div>
            <div className="empty-state-modal">
              <p>Les statistiques détaillées (tirs, possession, corners, etc.) ne sont pas disponibles en temps réel pour ce championnat via l'API actuelle.</p>
            </div>
          </section>

          <section className="modal-section">
            <div className="section-title">
              <Users size={18} />
              <h4>Compositions & Absences</h4>
            </div>
            <div className="empty-state-modal">
              <p>Compositions non disponibles. Celles-ci sont généralement publiées 60 minutes avant le coup d'envoi.</p>
            </div>
          </section>

          <section className="modal-section">
            <div className="section-title">
              <Newspaper size={18} />
              <h4>Actualités & IA Insights</h4>
            </div>
            <div className="news-container">
              {selected.news && selected.news.length > 0 ? (
                selected.news.map((item, idx) => (
                  <div key={idx} className="news-item">
                    <div className="news-header">
                      <strong>{item.title}</strong>
                      <small>{item.date}</small>
                    </div>
                    <p>{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state-modal">
                  <p>Aucune actualité majeure signalée pour cette rencontre aujourd'hui.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="final-prediction-box">
          <div className="prediction-header">
            <strong>🤖 PRONOSTIC IA</strong>
            <span className="confidence-label">Confiance : {selected.prediction.confidence}%</span>
          </div>

          <div className="prediction-results">
            <div className="res-item">
              <small>VAINQUEUR</small>
              <strong>{selected.prediction.winner}</strong>
            </div>
            <div className="res-item">
              <small>SCORE EXACT</small>
              <strong>{selected.prediction.score}</strong>
            </div>
            <div className="res-item">
              <small>PROBABILITÉ</small>
              <strong>{selected.prediction.confidence}%</strong>
            </div>
          </div>

          {selected.prediction.probabilities && (
            <div className="detailed-probs">
              <div className="d-prob">
                <span>Victoire Domicile</span>
                <strong>{selected.prediction.probabilities.home}%</strong>
              </div>
              <div className="d-prob">
                <span>Match Nul</span>
                <strong>{selected.prediction.probabilities.draw}%</strong>
              </div>
              <div className="d-prob">
                <span>Victoire Extérieur</span>
                <strong>{selected.prediction.probabilities.away}%</strong>
              </div>
            </div>
          )}

          <div className="prediction-footer">
            <span>Marché : {selected.prediction.marketLabel}</span>
            <p className="rec-text">{selected.prediction.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
