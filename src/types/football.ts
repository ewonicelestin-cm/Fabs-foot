export interface Team {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string | null;
  area?: {
    name?: string;
  };
}

export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem?: string | null;
  area?: {
    name?: string;
  };
  currentSeason?: {
    id?: number;
    startDate?: string;
    endDate?: string;
    currentMatchday?: number;
  };
}

export interface Score {
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime?: {
    home: number | null;
    away: number | null;
  };
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;

  competition: {
    id: number;
    name: string;
    code: string;
    emblem?: string | null;
  };

  homeTeam: Team;
  awayTeam: Team;

  score: Score;
}

export interface StandingRow {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingTable {
  stage?: string;
  type?: string;
  table: StandingRow[];
}

export interface Scorer {
  player: {
    id: number;
    name: string;
  };

  team: Team;

  goals: number;
  assists?: number;
}

export interface MatchesResponse {
  matches: Match[];
}

export interface CompetitionsResponse {
  competitions: Competition[];
}

export interface StandingsResponse {
  standings: StandingTable[];
}

export interface ScorersResponse {
  scorers: Scorer[];
}

export interface Prediction {
  matchId: number;

  homeTeam: string;
  awayTeam: string;

  homeProbability: number;
  drawProbability: number;
  awayProbability: number;

  predictedResult: "1" | "X" | "2";

  doubleChance: "1X" | "X2" | "12";

  over25Probability: number;
  under25Probability: number;

  confidence: number;

  homeForm: number;
  awayForm: number;

  homeStrength: number;
  awayStrength: number;

  explanation: string;
}