export interface TeamStats {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  averageGoalsFor: number;
  averageGoalsAgainst: number;
  form: number;
}

export interface PredictionResult {
  winner: "Domicile" | "Nul" | "Extérieur";
  confidence: number;
  doubleChance: string;
  btts: string;
  over15: string;
  over25: string;
  under35: string;
  homeGoals: number;
  awayGoals: number;
  score: string;
  recommendation: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getStrength(stats: TeamStats): number {
  if (stats.played === 0) return 0.5;

  const attack = clamp(stats.averageGoalsFor / 3, 0, 1);
  const defense = 1 - clamp(stats.averageGoalsAgainst / 3, 0, 1);

  const form = stats.form / 100;

  return attack * 0.4 + defense * 0.3 + form * 0.3;
}

export function analyzeMatch(
  home: TeamStats,
  away: TeamStats
): PredictionResult {
  const homeStrength = getStrength(home);
  const awayStrength = getStrength(away);

  // Avantage domicile
  const homeScore =
    homeStrength * 0.65 +
    home.form / 100 * 0.2 +
    0.15;

  const awayScore =
    awayStrength * 0.65 +
    away.form / 100 * 0.2;

  const totalStrength = homeScore + awayScore;

  let homeProbability =
    (homeScore / totalStrength) * 100;

  let awayProbability =
    (awayScore / totalStrength) * 100;

  let drawProbability =
    100 - homeProbability - awayProbability;

  // On maintient une probabilité réaliste de nul
  drawProbability = clamp(drawProbability, 15, 32);

  const remaining = 100 - drawProbability;

  const factor = homeProbability + awayProbability;

  homeProbability =
    (homeProbability / factor) * remaining;

  awayProbability =
    (awayProbability / factor) * remaining;

  let winner: "Domicile" | "Nul" | "Extérieur";

  if (
    homeProbability >= awayProbability &&
    homeProbability >= drawProbability
  ) {
    winner = "Domicile";
  } else if (
    awayProbability >= homeProbability &&
    awayProbability >= drawProbability
  ) {
    winner = "Extérieur";
  } else {
    winner = "Nul";
  }

  const confidence = Math.round(
    Math.max(
      homeProbability,
      drawProbability,
      awayProbability
    )
  );

  const expectedHomeGoals = clamp(
    home.averageGoalsFor * 0.65 +
      away.averageGoalsAgainst * 0.35 +
      0.25,
    0,
    4
  );

  const expectedAwayGoals = clamp(
    away.averageGoalsFor * 0.65 +
      home.averageGoalsAgainst * 0.35,
    0,
    4
  );

  const homeGoals = Math.max(
    0,
    Math.round(expectedHomeGoals)
  );

  const awayGoals = Math.max(
    0,
    Math.round(expectedAwayGoals)
  );

  const totalGoals = homeGoals + awayGoals;

  const btts =
    homeGoals > 0 && awayGoals > 0
      ? "Oui"
      : "Non";

  const over15 =
    totalGoals >= 2 ? "Oui" : "Non";

  const over25 =
    totalGoals >= 3 ? "Oui" : "Non";

  const under35 =
    totalGoals <= 3 ? "Oui" : "Non";

  let doubleChance: string;

  if (winner === "Domicile") {
    doubleChance = "1X";
  } else if (winner === "Extérieur") {
    doubleChance = "X2";
  } else {
    doubleChance = "1X / X2";
  }

  let recommendation = "Match incertain";

  if (confidence >= 70) {
    recommendation = "Très favorable";
  } else if (confidence >= 60) {
    recommendation = "Favorable";
  } else if (confidence >= 52) {
    recommendation = "Modéré";
  }

  return {
    winner,
    confidence,
    doubleChance,
    btts,
    over15,
    over25,
    under35,
    homeGoals,
    awayGoals,
    score: `${homeGoals}-${awayGoals}`,
    recommendation,
  };
}