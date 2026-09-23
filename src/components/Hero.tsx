import React from "react";
import { AnalyzedMatch } from "../types";
import { TrendingUp, Trophy } from "lucide-react";

interface HeroProps {
  matches: AnalyzedMatch[];
  averagePotential: number;
  featuredMatch: AnalyzedMatch | undefined;
}

export const Hero: React.FC<HeroProps> = ({
  matches,
  averagePotential,
  featuredMatch,
}) => {
  const todayDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <section className="hero">
      <div className="hero-glow" />

      <div className="hero-content">
        <div>
          <span className="badge">🤖 ANALYSE IA · {todayDate}</span>

          <h2>
            FAB-FOOT,
            <br />
            l'analyse intelligente.
          </h2>

          <p>
            Forme récente, buts marqués, buts encaissés et avantage domicile.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-pill">
            <Trophy size={16} />
            <span>Matchs du jour</span>
            <strong>{matches.length}</strong>
          </div>

          <div className="metric-pill primary">
            <TrendingUp size={16} />
            <span>Potentiel moyen</span>
            <strong>{averagePotential}</strong>
          </div>

          {featuredMatch && (
            <div className="metric-pill">
              <span>Match phare</span>
              <strong>
                {featuredMatch.match.strHomeTeam
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}
                <small> vs </small>
                {featuredMatch.match.strAwayTeam
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}
              </strong>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
