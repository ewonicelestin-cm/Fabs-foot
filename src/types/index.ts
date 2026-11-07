export type Match = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  dateEvent?: string;
  strTime?: string;
  strCompetition?: string;
  strLeague?: string;
  strCountry?: string;
  strThumb?: string;
  strVideo?: string;
  strStatus?: string;
  intHomeScore?: number | string | null;
  intAwayScore?: number | string | null;
  strDescriptionEN?: string;
  sourceUrl?: string;
};

export type OfficialDataSource = {
  id: string;
  label: string;
  url: string;
  status: "ok" | "unavailable" | "no_public_match_data";
  matchCount: number;
  detail?: string;
};

export type OfficialMatchData = {
  updatedAt: string | null;
  coverage: "complete" | "partial" | "unavailable";
  sources: OfficialDataSource[];
  matches: Match[];
  teamStats: Record<string, TeamStats>;
};

export type AdvancedStats = {
  possession: { home: string; away: string };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  cards: { home: { yellow: number; red: number }; away: { yellow: number; red: number } };
  offsides: { home: number; away: number };
};

export type Lineup = {
  home: string[];
  away: string[];
  absences: { home: string[]; away: string[] };
};

export type News = {
  title: string;
  content: string;
  date: string;
};

export type TeamStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
};

export type MatchMetricProjection = {
  home: number;
  away: number;
  total: number;
  rangeMin: number;
  rangeMax: number;
};

export type Prediction = {
  winner: string;
  confidence: number;
  valueScore: number;
  dataBasis: "verified" | "partial" | "fallback";
  marketLabel: string;
  doubleChance: string;
  btts: string;
  over15: string;
  over25: string;
  under35: string;
  score: string;
  recommendation: string;
  isPremium: boolean;
  theoreticalOdds?: number;
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  halfTimeStudy?: {
    probOver05: number;
    probOver15: number;
    likelyScore: string;
  };
  secondHalfStudy?: {
    intensity: 'HAUTE' | 'MODÉRÉE' | 'BASSE';
    probGoals: number;
  };
  metricProjections: {
    shotsOnTarget: MatchMetricProjection;
    corners: MatchMetricProjection;
  };
};

export type CompetitionContext = {
  label: string;
  importance: number;
  amplitude: string;
  insight: string;
};

export type AnalyzedMatch = {
  match: Match;
  home: TeamStats;
  away: TeamStats;
  prediction: Prediction;
  competition: CompetitionContext;
  advancedStats?: AdvancedStats;
  lineup?: Lineup;
  news?: News[];
};
