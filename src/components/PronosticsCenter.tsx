import React, { useState } from "react";
import { AnalyzedMatch } from "../types";
import { Target, Filter, ShieldAlert, CheckCircle, HelpCircle } from "lucide-react";
import { getForm } from "../services/api";

interface PronosticsCenterProps {
  matches: AnalyzedMatch[];
  onSelect: (item: AnalyzedMatch) => void;
}

export const PronosticsCenter: React.FC<PronosticsCenterProps> = ({ matches, onSelect }) => {
  const [marketFilter, setMarketFilter] = useState<string>("ALL");
  const [competitionFilter, setCompetitionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [teamSearch, setTeamSearch] = useState<string>("");

  // Extract unique competitions
  const competitions = Array.from(
    new Set(matches.map((m) => m.match.strLeague || m.competition.label))
  );

  const filteredMatches = matches.filter((item) => {
    // Team search
    if (teamSearch) {
      const q = teamSearch.toLowerCase();
      const matchTeam =
        item.match.strHomeTeam.toLowerCase().includes(q) ||
        item.match.strAwayTeam.toLowerCase().includes(q);
      if (!matchTeam) return false;
    }

    // Competition filter
    if (competitionFilter !== "ALL") {
      const comp = item.match.strLeague || item.competition.label;
      if (comp !== competitionFilter) return false;
    }

    // Status filter
    if (statusFilter !== "ALL") {
      const status = item.match.strStatus || "Upcoming";
      if (statusFilter === "FINISHED" && status !== "Match Finished") return false;
      if (statusFilter === "UPCOMING" && status === "Match Finished") return false;
    }

    // Market filter
    if (marketFilter !== "ALL") {
      if (marketFilter === "1N2" && !item.prediction.winner) return false;
      if (marketFilter === "DOUBLE_CHANCE" && !item.prediction.doubleChance) return false;
      if (marketFilter === "BTTS" && item.prediction.btts !== "Oui") return false;
      if (marketFilter === "OVER25" && item.prediction.over25 !== "Oui") return false;
    }

    return true;
  });

  return (
    <div className="rubric-view">
      <div className="rubric-view-header">
        <h2><Target size={24} /> Centre de Pronostics & Analyses Statistiques</h2>
        <p>Filtrez les pronostics par marché, compétition et statut. Transparence totale sur les facteurs IA et données manquantes.</p>
      </div>

      {/* Advanced Filters Bar */}
      <div className="pronos-filters-panel" style={{ background: 'var(--panel)', padding: '20px', borderRadius: '14px', marginBottom: '25px', border: '1px solid var(--line-strong)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Recherche par équipe</label>
          <input
            type="text"
            placeholder="Ex: Sénégal, Espagne..."
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Compétition</label>
          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            <option value="ALL">Toutes les compétitions</option>
            {competitions.map((c, idx) => (
              <option key={idx} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Marché de Paris</label>
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            <option value="ALL">Tous les marchés</option>
            <option value="1N2">1N2 (Vainqueur)</option>
            <option value="DOUBLE_CHANCE">Double Chance (1X / X2)</option>
            <option value="BTTS">Les deux équipes marquent (BTTS)</option>
            <option value="OVER25">Plus de 2.5 buts</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Statut du match</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="UPCOMING">À venir</option>
            <option value="FINISHED">Terminés</option>
          </select>
        </div>

      </div>

      {/* Transparent Data Policy Notice */}
      <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)', padding: '15px', borderRadius: '10px', marginBottom: '25px', fontSize: '13px', color: 'var(--text-soft)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <HelpCircle size={20} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Politique de Transparence Statistique :</strong> Les probabilités affichées proviennent exclusivement du calcul algorithmique (Loi de Poisson sur l'historique officiel disponible).
          <br /><em>Données manquantes transparentes :</em> Les statistiques de corners en direct et compositions officielles temps réel ne sont pas garanties par l'API publique tierce et sont signalées le cas échéant. Zéro cote ou résultat réel n'est inventé.
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="message">Aucun pronostic ne correspond aux filtres sélectionnés.</div>
      ) : (
        <div className="prediction-grid">
          {filteredMatches.map((item) => {
            const p = item.prediction;
            const homeForm = getForm(item.home);
            const awayForm = getForm(item.away);

            return (
              <div key={item.match.idEvent} className="prediction-card" style={{ padding: '22px' }}>
                <div className="match-header">
                  <span>{item.match.dateEvent || "Aujourd'hui"} • {item.match.strTime || "--:--"}</span>
                  <span className={`status-pill ${item.match.strStatus === 'Match Finished' ? 'finished' : 'upcoming'}`}>
                    {item.match.strStatus === 'Match Finished' ? 'Résultat Réel' : 'Prédiction IA'}
                  </span>
                </div>

                <div className="competition-chip" style={{ marginTop: '12px' }}>
                  <strong>{item.match.strLeague || item.competition.label}</strong>
                  <span>Confiance IA : {p.confidence}%</span>
                </div>

                <div className="teams" style={{ margin: '18px 0' }}>
                  <strong>{item.match.strHomeTeam}</strong>
                  <span>VS</span>
                  <strong>{item.match.strAwayTeam}</strong>
                </div>

                {/* Statistical Factors breakdown */}
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '10px', marginBottom: '15px', fontSize: '12px' }}>
                  <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '6px' }}>Facteurs Statistiques Analysés :</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: 'var(--text-muted)' }}>
                    <div>Forme Domicile : <strong style={{ color: 'var(--text)' }}>{homeForm}%</strong></div>
                    <div>Forme Extérieur : <strong style={{ color: 'var(--text)' }}>{awayForm}%</strong></div>
                    <div>Buts marqués (dom) : <strong style={{ color: 'var(--text)' }}>{item.home.goalsFor}</strong></div>
                    <div>Buts marqués (ext) : <strong style={{ color: 'var(--text)' }}>{item.away.goalsFor}</strong></div>
                  </div>
                </div>

                {/* Probabilities vs Real outcome separation */}
                <div className="main-predictions">
                  <div>
                    <small>PRONOSTIC IA (Calculé)</small>
                    <strong style={{ color: 'var(--success)' }}>{p.winner}</strong>
                  </div>
                  <div>
                    <small>DOUBLE CHANCE</small>
                    <strong>{p.doubleChance}</strong>
                  </div>
                </div>

                <div className="markets" style={{ marginTop: '12px' }}>
                  <div><span>BTTS (Les 2 marquent)</span><strong>{p.btts}</strong></div>
                  <div><span>Plus de 2.5 buts</span><strong>{p.over25}</strong></div>
                </div>

                {/* Missing Data Transparent Disclosure */}
                <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                  ⚠️ <em>Données de corners et tirs :</em> Non disponibles via l'API actuelle pour cette rencontre.
                </div>

                <button className="details" onClick={() => onSelect(item)} style={{ marginTop: '15px' }}>
                  <span>Voir l'analyse détaillée</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
