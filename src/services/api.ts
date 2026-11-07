import {
  Match,
  TeamStats,
  Prediction,
  CompetitionContext,
  AnalyzedMatch,
  News,
  OfficialMatchData,
} from "../types";

/**
 * GENERATE DYNAMIC NEWS
 * Transforms stats and predictions into human-readable news snippets.
 */
export function generateMatchNews(match: Match, home: TeamStats, away: TeamStats, pred: Prediction): News[] {
  const news: News[] = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Form News
  if (home.played > 0) {
    const homeForm = getForm(home);
    news.push({
      title: `Dynamique ${match.strHomeTeam}`,
      content: `${match.strHomeTeam} affiche une forme de ${homeForm}% sur ses ${home.played} dernières sorties.`,
      date: now
    });
  }

  // 2. Goal News
  if (pred.probabilities) {
    const totalProb = pred.probabilities.home + pred.probabilities.away;
    if (totalProb > 70) {
      news.push({
        title: "Alerte Spectacle",
        content: `L'IA détecte un match ouvert avec une forte probabilité de buts (${pred.score} attendu).`,
        date: now
      });
    }
  }

  // 3. Betting/Market News
  if (pred.isPremium) {
    news.push({
      title: "Opportunité Premium",
      content: "Ce match est classé à fort potentiel selon les probabilités calculées par le modèle.",
      date: now
    });
  }

  return news;
}

export function emptyStats(): TeamStats {
  return {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

export async function getOfficialMatchData(): Promise<OfficialMatchData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/official-matches.json`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Impossible de charger les données officielles (${response.status}).`);
  }

  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== "object" ||
    !("matches" in data) ||
    !Array.isArray(data.matches) ||
    !("teamStats" in data) ||
    !data.teamStats ||
    typeof data.teamStats !== "object" ||
    !("sources" in data) ||
    !Array.isArray(data.sources)
  ) {
    throw new Error("Le fichier des données officielles a un format invalide.");
  }

  return data as OfficialMatchData;
}

export function getSnapshotTeamStats(data: OfficialMatchData, teamName: string): TeamStats {
  const normalized = teamName.trim().toLocaleLowerCase();
  return data.teamStats[normalized] ?? emptyStats();
}

export function getForm(stats: TeamStats): number {
  if (!stats.played) return 50;

  return Math.round(
    ((stats.wins * 3 + stats.draws) / (stats.played * 3)) * 100
  );
}

export function deriveCompetitionContext(
  homeTeam: string,
  awayTeam: string,
  competitionName: string = ""
): CompetitionContext {
  const normalized = `${homeTeam} ${awayTeam} ${competitionName}`.toLowerCase();

  if (
    normalized.includes("paris saint-germain") ||
    normalized.includes("aston villa")
  ) {
    return {
      label: "Super Coupe d’Europe",
      importance: 96,
      amplitude: "Très élevée",
      insight:
        "Rencontre à forte valeur symbolique avec enjeu majeur pour le prestige continental et la réputation des clubs.",
    };
  }

  if (
    normalized.includes("champions") ||
    normalized.includes("europa") ||
    normalized.includes("ligue")
  ) {
    return {
      label: "Compétition européenne",
      importance: 90,
      amplitude: "Élevée",
      insight:
        "Le niveau de pression est fort, car la qualification et la crédibilité européenne sont en jeu.",
    };
  }

  if (normalized.includes("finale") || normalized.includes("coupe")) {
    return {
      label: "Coupe nationale",
      importance: 86,
      amplitude: "Élevée",
      insight:
        "Le match prend une dimension tactique et psychologique forte, avec un enjeu de titre.",
    };
  }

  if (normalized.includes("derby") || normalized.includes("classico")) {
    return {
      label: "Rivalité majeure",
      importance: 82,
      amplitude: "Élevée",
      insight:
        "Le contexte émotionnel et historique compense souvent la forme pure, ce qui influe sur le pronostic.",
    };
  }

  return {
    label: competitionName || "Championnat",
    importance: 72,
    amplitude: "Standard",
    insight:
      "Le match reste important, mais son enjeu est surtout lié à la position et à la dynamique de la saison.",
  };
}

export function getMatchPriorityScore(
  match: Match,
  home: TeamStats,
  away: TeamStats
): number {
  const normalized = `${match.strHomeTeam} ${match.strAwayTeam}`.toLowerCase();
  const competitionName = (match.strCompetition ?? "").toLowerCase();

  const majorLeagues = [
    "premier league",
    "la liga",
    "serie a",
    "bundesliga",
    "ligue 1",
    "champions league",
    "europa league",
    "uefa",
    "super coupe",
    "super cup",
  ];

  const prestigeTeams = [
    "paris saint-germain", "psg", "real madrid", "barcelona", "manchester city",
    "bayern munich", "inter", "chelsea", "liverpool", "arsenal", "juventus",
    "atletico", "napoli", "milan", "dortmund", "tottenham", "leverkusen"
  ];

  let score = 0;

  // 1. ABSOLUTE PRIORITY: Major European Leagues (+5000)
  if (majorLeagues.some((league) => competitionName.includes(league))) {
    score += 5000;
  }

  // 2. DIVERSITY BOOST: Specific requested countries (+2000)
  const diversityCountries = ["norway", "switzerland", "poland", "ireland", "denmark", "iceland", "sweden", "belgium"];
  if (diversityCountries.some(country => competitionName.toLowerCase().includes(country))) {
    score += 2000;
  }

  // 3. PRESTIGE PRIORITY: Elite Clubs (+1000)
  if (prestigeTeams.some((team) => normalized.includes(team))) {
    score += 1000;
  }

  // 3. STATISTICAL PRIORITY
  const homeForm = getForm(home);
  const awayForm = getForm(away);
  score += Math.abs(homeForm - awayForm) / 4;

  if (home.goalsFor + away.goalsFor > 25) {
    score += 50;
  }

  return score;
}

function factorial(n: number): number {
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(lambda: number, k: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

export function analyzeMatch(home: TeamStats, away: TeamStats): Prediction {
  const dataBasis = home.played > 0 && away.played > 0
    ? "verified"
    : home.played > 0 || away.played > 0
      ? "partial"
      : "fallback";
  const homeForm = home.played > 0 ? getForm(home) : 50;
  const awayForm = away.played > 0 ? getForm(away) : 50;

  const homeAvgScored = home.played > 0 ? home.goalsFor / home.played : 1.25;
  const homeAvgConceded = home.played > 0 ? home.goalsAgainst / home.played : 1.25;
  const awayAvgScored = away.played > 0 ? away.goalsFor / away.played : 1.25;
  const awayAvgConceded = away.played > 0 ? away.goalsAgainst / away.played : 1.25;

  // Form adjustment factor (recent performance impact)
  const formImpactHome = 1 + (homeForm - 50) / 200;
  const formImpactAway = 1 + (awayForm - 50) / 200;

  // Expected goals (Lambda) calculation
  // Home advantage included (+15% attack for home team)
  let lambdaHome = homeAvgScored * awayAvgConceded * 1.15 * formImpactHome;
  let lambdaAway = awayAvgScored * homeAvgConceded * formImpactAway;

  // Normalize lambdas to realistic football boundaries
  lambdaHome = Math.max(0.1, Math.min(4.5, lambdaHome));
  lambdaAway = Math.max(0.1, Math.min(4.5, lambdaAway));

  // 2. Build Probability Matrix using Poisson Distribution (up to 6 goals each)
  let probHome = 0;
  let probDraw = 0;
  let probAway = 0;
  let probBTTS = 0;
  let probOver25 = 0;
  let probUnder35 = 0;
  let maxProb = 0;
  let bestScore = "1-1";

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const p = poisson(lambdaHome, h) * poisson(lambdaAway, a);

      if (h > a) probHome += p;
      else if (h === a) probDraw += p;
      else probAway += p;

      if (h > 0 && a > 0) probBTTS += p;
      if (h + a > 2.5) probOver25 += p;
      if (h + a < 3.5) probUnder35 += p;

      if (p > maxProb) {
        maxProb = p;
        bestScore = `${h}-${a}`;
      }
    }
  }

  // 3. Final Prediction Logic based on Probabilities
  let winner = "Nul";
  let probWinner = probDraw;

  if (probHome > probAway && probHome > probDraw) {
    winner = "Domicile";
    probWinner = probHome;
  } else if (probAway > probHome && probAway > probDraw) {
    winner = "Extérieur";
    probWinner = probAway;
  }

  const confidence = Math.round(probWinner * 100);

  // Theoretical odds based on AI probability (1/P)
  const theoreticalOdds = Number((1 / probWinner).toFixed(2));

  const valueScore = Math.min(
    99,
    Math.round(
      confidence * 0.8 +
      (Math.abs(homeForm - awayForm) * 0.2) +
      (probOver25 > 0.6 ? 5 : 0)
    )
  );

  const marketLabel =
    valueScore >= 88 ? "POTENTIEL ÉLEVÉ" :
    valueScore >= 78 ? "Potentiel favorable" :
    "Potentiel modéré";

  // PREMIUM LOGIC: Automatic billing target for high value matches with odds >= 1.75
  const isPremium = (valueScore >= 78) && (theoreticalOdds >= 1.75);

  let recommendation = "Analyse complexe";
  if (confidence >= 65) recommendation = "Pronostic haute probabilité";
  else if (confidence >= 55) recommendation = "Pronostic favorable";
  else if (confidence >= 45) recommendation = "Pronostic modéré";

  // 4. Time-Period Study (1H vs 2H)
  // Historically ~45% goals in 1H and ~55% in 2H
  const lambda1H = (lambdaHome + lambdaAway) * 0.45;
  const prob1HOver05 = Math.round((1 - poisson(lambda1H, 0)) * 100);
  const prob1HOver15 = Math.round((1 - poisson(lambda1H, 0) - poisson(lambda1H, 1)) * 100);

  const intensity2H = (lambdaHome + lambdaAway) > 2.8 ? 'HAUTE' : (lambdaHome + lambdaAway) > 1.8 ? 'MODÉRÉE' : 'BASSE';

  const shotsOnTargetHome = Math.round(Math.max(1, Math.min(7, lambdaHome * 3.2)));
  const shotsOnTargetAway = Math.round(Math.max(1, Math.min(7, lambdaAway * 3.2)));
  const cornersHome = Math.round(Math.max(2, Math.min(9, 4.7 + (lambdaHome - 1.3) * 1.2)));
  const cornersAway = Math.round(Math.max(2, Math.min(9, 4.7 + (lambdaAway - 1.3) * 1.2)));
  const metricProjection = (homeEstimate: number, awayEstimate: number) => ({
    home: homeEstimate,
    away: awayEstimate,
    total: homeEstimate + awayEstimate,
    rangeMin: Math.max(0, homeEstimate + awayEstimate - 2),
    rangeMax: homeEstimate + awayEstimate + 2,
  });

  return {
    winner,
    confidence,
    valueScore,
    dataBasis,
    marketLabel,
    isPremium,
    theoreticalOdds,
    doubleChance: winner === "Domicile" ? "1X" : winner === "Extérieur" ? "X2" : "1X/X2",
    btts: probBTTS > 0.52 ? "Oui" : "Non",
    over15: (1 - poisson(lambdaHome, 0) * poisson(lambdaAway, 0) - poisson(lambdaHome, 1) * poisson(lambdaAway, 0) - poisson(lambdaHome, 0) * poisson(lambdaAway, 1)) > 0.6 ? "Oui" : "Non",
    over25: probOver25 > 0.5 ? "Oui" : "Non",
    under35: probUnder35 > 0.6 ? "Oui" : "Non",
    score: bestScore,
    recommendation,
    probabilities: {
      home: Math.round(probHome * 100),
      draw: Math.round(probDraw * 100),
      away: Math.round(probAway * 100),
    },
    halfTimeStudy: {
      probOver05: prob1HOver05,
      probOver15: prob1HOver15,
      likelyScore: lambda1H > 1.2 ? "1-0" : "0-0"
    },
    secondHalfStudy: {
      intensity: intensity2H,
      probGoals: Math.round(55 + (intensity2H === 'HAUTE' ? 20 : 0))
    },
    metricProjections: {
      shotsOnTarget: metricProjection(shotsOnTargetHome, shotsOnTargetAway),
      corners: metricProjection(cornersHome, cornersAway),
    },
  };
}

/**
 * FAB-FOOT IA PREMIUM COMBO
 * Logic to select and accumulate high-value matches for premium users.
 */
export function getPremiumCombo(matches: AnalyzedMatch[]): AnalyzedMatch[] {
  return matches
    .filter(m => m.prediction.isPremium)
    .sort((a, b) => b.prediction.valueScore - a.prediction.valueScore)
    .slice(0, 3); // Top 3 matches for a premium parlay
}

/**
 * COUNTRY CODE MAPPING
 * Used for flags (flagcdn API)
 */
const COUNTRY_CODES: Record<string, string> = {
  "England": "gb", "Spain": "es", "France": "fr", "Germany": "de", "Italy": "it",
  "Norway": "no", "Switzerland": "ch", "Poland": "pl", "Ireland": "ie", "Denmark": "dk",
  "Iceland": "is", "Sweden": "se", "Belgium": "be", "Austria": "at", "Portugal": "pt",
  "Netherlands": "nl", "Scotland": "gb-sct", "Greece": "gr", "Turkey": "tr", "Brazil": "br",
  "Argentina": "ar", "USA": "us", "Mexico": "mx", "Cameroon": "cm", "Egypt": "eg",
  "South Africa": "za", "Morocco": "ma", "Algeria": "dz", "Tunisia": "tn", "Senegal": "sn"
};

export function getFlagUrl(countryName?: string): string | null {
  if (!countryName) return null;
  const code = COUNTRY_CODES[countryName];
  if (!code) return `https://flagcdn.com/w40/${countryName.toLowerCase().slice(0, 2)}.png`; // Fallback
  return `https://flagcdn.com/w40/${code}.png`;
}
