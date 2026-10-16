import React from "react";
import { AnalyzedMatch } from "../types";
import { getForm, getFlagUrl } from "../services/api";
import { Info, Star } from "lucide-react";

interface MatchCardProps {
  item: AnalyzedMatch;
  onSelect: (item: AnalyzedMatch) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (matchId: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ item, onSelect, isFavorite, onToggleFavorite }) => {
  const p = item.prediction;
  const flag = getFlagUrl(item.match.strCountry);

  const cardTone =
    p.valueScore >= 85 ? "hot" : p.valueScore >= 75 ? "strong" : "normal";

  return (
    <article className={`prediction-card ${cardTone}`}>
      <div className="match-header">
        <div className="match-meta">
          <span>{item.match.dateEvent ?? "Aujourd'hui"}</span>
          <span className="dot">•</span>
          <span>{item.match.strTime ?? "--:--"}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.match.idEvent);
              }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
              title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Star
                size={18}
                fill={isFavorite ? "#fbbf24" : "none"}
                color={isFavorite ? "#fbbf24" : "var(--text-muted)"}
              />
            </button>
          )}
          <span className={`status-pill ${item.match.strStatus === 'Match Finished' ? 'finished' : 'upcoming'}`}>
            {item.match.strStatus === 'Match Finished' ? 'Terminé' : 'À venir'}
          </span>
        </div>
      </div>

      <div className="competition-chip">
        <div className="competition-info">
          {flag && <img src={flag} alt="" className="country-flag" />}
          <strong>{item.match.strLeague || item.competition.label}</strong>
        </div>
        <span>Enjeu {item.competition.importance}/100</span>
      </div>

      <div className="teams">
        <strong>{item.match.strHomeTeam}</strong>
        <span>VS</span>
        <strong>{item.match.strAwayTeam}</strong>
      </div>

      <div className="confidence">
        <strong>{p.valueScore}</strong>
        <span>potentiel IA / certitude</span>
      </div>

      {p.probabilities && (
        <div className="probability-bar">
          <div className="prob-item">
            <span>1</span>
            <strong>{p.probabilities.home}%</strong>
          </div>
          <div className="prob-item">
            <span>X</span>
            <strong>{p.probabilities.draw}%</strong>
          </div>
          <div className="prob-item">
            <span>2</span>
            <strong>{p.probabilities.away}%</strong>
          </div>
        </div>
      )}

      <div className="main-predictions">
        <div>
          <small>PRONOSTIC</small>
          <strong>{p.winner}</strong>
        </div>
        <div>
          <small>SCORE</small>
          <strong>{p.score}</strong>
        </div>
      </div>

      <div className="markets">
        <div>
          <span>Double chance</span>
          <strong>{p.doubleChance}</strong>
        </div>
        <div>
          <span>BTTS</span>
          <strong>{p.btts}</strong>
        </div>
        <div>
          <span>Plus de 1.5</span>
          <strong>{p.over15}</strong>
        </div>
        <div>
          <span>Plus de 2.5</span>
          <strong>{p.over25}</strong>
        </div>
        <div>
          <span>Moins de 3.5</span>
          <strong>{p.under35}</strong>
        </div>
      </div>

      <div className="form">
        <div>
          <strong>{item.match.strHomeTeam}</strong>
          <span>Forme {getForm(item.home)}%</span>
        </div>
        <div>
          <strong>{item.match.strAwayTeam}</strong>
          <span>Forme {getForm(item.away)}%</span>
        </div>
      </div>

      <div className="recommendation">🤖 {p.recommendation}</div>

      <div className="competition-insight">
        <strong>{p.marketLabel}</strong>
        <span>{item.competition.insight}</span>
      </div>

      <button className="details" onClick={() => onSelect(item)}>
        <Info size={16} />
        <span>Voir l'analyse détaillée</span>
      </button>
    </article>
  );
};
