import React from "react";
import { AnalyzedMatch } from "../types";
import { AlertCircle, Users, Activity, Newspaper, ShieldAlert, CheckCircle2, BarChart, Calendar, Trophy, CheckSquare } from "lucide-react";
import { getFlagUrl, getForm } from "../services/api";
import { getActualMatchScore, getActualMatchScoreLabel, getMatchStatusLabel } from "../services/matchStatus";

interface MatchModalProps {
  selected: AnalyzedMatch;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({
  selected,
  onClose,
}) => {
  const flag = getFlagUrl(selected.match.strCountry);
  const homeForm = selected.home.played > 0 ? getForm(selected.home) : null;
  const awayForm = selected.away.played > 0 ? getForm(selected.away) : null;
  const actualScore = getActualMatchScore(selected.match);

  const hasEnoughDataHome = selected.home.played >= 3;
  const hasEnoughDataAway = selected.away.played >= 3;

  const homeAvgGoals = (selected.home.goalsFor / Math.max(1, selected.home.played)).toFixed(2);
  const awayAvgGoals = (selected.away.goalsFor / Math.max(1, selected.away.played)).toFixed(2);

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="close" onClick={onClose}>
          ✕
        </button>

        {/* Section 1: Données issues des sources officielles */}
        <div className="modal-header-main">
          <h2>Fiche Détaillée & Officielle du Match</h2>
          <span className="status-badge">{getMatchStatusLabel(selected.match)}</span>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '10px', margin: '15px 0', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} style={{ color: 'var(--primary)' }} />
            <strong>{selected.match.strLeague || selected.competition.label}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Calendar size={16} />
            <span>{selected.match.dateEvent || "Aujourd'hui"} • {selected.match.strTime || "--:--"}</span>
          </div>
        </div>

        <h3 style={{ textAlign: 'center', fontSize: '22px', margin: '20px 0' }}>
          {selected.match.strHomeTeam} <span style={{ color: '#0ea5e9', fontSize: '16px' }}>VS</span> {selected.match.strAwayTeam}
        </h3>
        {actualScore && (
          <div className="actual-match-score" aria-label={`${getActualMatchScoreLabel(selected.match)} : ${actualScore}`}>
            <span>{getActualMatchScoreLabel(selected.match)}</span>
            <strong>{actualScore}</strong>
          </div>
        )}

        <div className="competition-chip detail-competition">
          <div className="competition-info">
            {flag && <img src={flag} alt="" className="country-flag" />}
            <strong>Contexte de l'enjeu</strong>
          </div>
          <span>Importance : {selected.competition.importance}/100</span>
        </div>

        <p className="competition-insight textual">
          {selected.competition.amplitude} — {selected.competition.insight}
        </p>

        <div className="modal-sections">

          {/* Section 2: Comparaison Visuelle & Statistiques Calculées */}
          <section className="modal-section">
            <div className="section-title">
              <BarChart size={18} />
              <h4>Comparaison Visuelle & Statistiques Calculées</h4>
            </div>

            {!hasEnoughDataHome || !hasEnoughDataAway ? (
              <div style={{ background: 'rgba(212, 175, 184, 0.1)', border: '1px solid var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--danger)', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <ShieldAlert size={18} />
                <span><strong>Historique limité :</strong> Moins de 3 matchs vérifiés pour l’une des équipes. Les pronostics affichés utilisent une estimation de secours et sont moins fiables.</span>
              </div>
            ) : null}

            {/* Visual comparison bars */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>
                <span>{selected.match.strHomeTeam} ({homeForm === null ? "N/D" : `${homeForm}%`})</span>
                <span>Indice de Forme Comparé</span>
                <span>{selected.match.strAwayTeam} ({awayForm === null ? "N/D" : `${awayForm}%`})</span>
              </div>
              <div style={{ display: 'flex', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${homeForm ?? 0}%`, background: '#1683d8', transition: 'width 0.5s' }} />
                <div style={{ width: `${awayForm ?? 0}%`, background: '#0ea5e9', opacity: 0.7, transition: 'width 0.5s' }} />
              </div>
            </div>

            <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="stat-card">
                <strong>{selected.match.strHomeTeam}</strong>
                <div className="stat-row"><span>Matchs analysés :</span> <span>{selected.home.played}</span></div>
                <div className="stat-row"><span>Moyenne buts / match :</span> <strong>{homeAvgGoals}</strong></div>
                <div className="stat-row"><span>Bilan (V / N / D) :</span> <span>{selected.home.wins} / {selected.home.draws} / {selected.home.losses}</span></div>
              </div>

              <div className="stat-card">
                <strong>{selected.match.strAwayTeam}</strong>
                <div className="stat-row"><span>Matchs analysés :</span> <span>{selected.away.played}</span></div>
                <div className="stat-row"><span>Moyenne buts / match :</span> <strong>{awayAvgGoals}</strong></div>
                <div className="stat-row"><span>Bilan (V / N / D) :</span> <span>{selected.away.wins} / {selected.away.draws} / {selected.away.losses}</span></div>
              </div>
            </div>
          </section>

          <section className="modal-section">
            <div className="section-title">
              <Activity size={18} />
              <h4>Projections IA — tirs cadrés & corners</h4>
            </div>
            {selected.prediction.metricProjections ? (
              <>
                <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="stat-card">
                    <strong>Tirs cadrés estimés</strong>
                    <div className="stat-row"><span>{selected.match.strHomeTeam}</span><strong>{selected.prediction.metricProjections.shotsOnTarget.home}</strong></div>
                    <div className="stat-row"><span>{selected.match.strAwayTeam}</span><strong>{selected.prediction.metricProjections.shotsOnTarget.away}</strong></div>
                    <div className="stat-row"><span>Total probable</span><strong>{selected.prediction.metricProjections.shotsOnTarget.rangeMin}–{selected.prediction.metricProjections.shotsOnTarget.rangeMax}</strong></div>
                  </div>
                  <div className="stat-card">
                    <strong>Corners estimés</strong>
                    <div className="stat-row"><span>{selected.match.strHomeTeam}</span><strong>{selected.prediction.metricProjections.corners.home}</strong></div>
                    <div className="stat-row"><span>{selected.match.strAwayTeam}</span><strong>{selected.prediction.metricProjections.corners.away}</strong></div>
                    <div className="stat-row"><span>Total probable</span><strong>{selected.prediction.metricProjections.corners.rangeMin}–{selected.prediction.metricProjections.corners.rangeMax}</strong></div>
                  </div>
                </div>
                <p className="metric-projection-disclaimer">
                  {selected.prediction.dataBasis === "verified"
                    ? "Estimations générées exclusivement par le modèle à partir des buts et de la forme récents vérifiés."
                    : "Estimation IA de secours : l’historique vérifié est partiel ou absent, la précision est réduite."}
                  {" "}Aucune donnée de tirs ou corners en direct n’est présentée.
                </p>
              </>
            ) : null}
          </section>

          {/* Section 3: Compositions & Données Manquantes (Sans valeurs fictives) */}
          <section className="modal-section">
            <div className="section-title">
              <Users size={18} />
              <h4>Compositions Officielles & Absences</h4>
            </div>
            <div className="empty-state-modal">
              <ShieldAlert size={18} style={{ color: 'var(--warning)', marginBottom: '6px' }} />
              <p><strong>Données non disponibles :</strong> Les feuilles de match et compositions officielles ne sont pas fournies par les sources vérifiées pour cette rencontre. Aucune composition fictive n'est générée.</p>
            </div>
          </section>

          {/* Section 4: Marchés de Pronostics Pris en Charge */}
          <section className="modal-section">
            <div className="section-title">
              <CheckSquare size={18} />
              <h4>Marchés de Pronostics Pris en Charge</h4>
            </div>

            <div className="markets" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1N2 (Vainqueur)</span>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--success)', marginTop: '4px' }}>{selected.prediction.winner}</strong>
              </div>
              <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Double Chance</span>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{selected.prediction.doubleChance}</strong>
              </div>
              <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Les 2 équipes marquent (BTTS)</span>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{selected.prediction.btts}</strong>
              </div>
              <div style={{ padding: '12px', background: 'var(--panel)', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Plus de 2.5 Buts</span>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--primary)', marginTop: '4px' }}>{selected.prediction.over25}</strong>
              </div>
            </div>
          </section>

        </div>

        {/* Section 5: Estimations & Probabilités IA (Séparées clairement) */}
        <div className="final-prediction-box">
          <div className="prediction-header">
            <strong>🤖 ESTIMATIONS & PROBABILITÉS CALCULÉES (IA)</strong>
            <span className="confidence-label">Confiance : {selected.prediction.confidence}%</span>
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
            <span>Recommandation du modèle :</span>
            <p className="rec-text">{selected.prediction.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
