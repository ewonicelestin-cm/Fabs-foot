import { TeamStats } from "./prediction";

const API_URL =
  "https://www.thesportsdb.com/api/v1/json/3";

interface Team {
  idTeam: string;
  strTeam: string;
}

interface Event {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
}

interface TeamSearchResponse {
  teams: Team[] | null;
}

interface EventsResponse {
  results: Event[] | null;
}

export async function findTeam(
  teamName: string
): Promise<Team | null> {
  const url =
    `${API_URL}/searchteams.php?t=` +
    encodeURIComponent(teamName);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Erreur recherche équipe: ${response.status}`
    );
  }

  const data: TeamSearchResponse =
    await response.json();

  return data.teams?.[0] ?? null;
}

export async function getTeamStats(
  teamName: string
): Promise<TeamStats> {
  const team = await findTeam(teamName);

  if (!team) {
    return emptyStats(teamName);
  }

  const url =
    `${API_URL}/eventslast.php?id=${team.idTeam}`;

  const response = await fetch(url);

  if (!response.ok) {
    return emptyStats(teamName);
  }

  const data: EventsResponse =
    await response.json();

  const events = data.results ?? [];

  let played = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const event of events.slice(0, 10)) {
    if (
      event.intHomeScore === null ||
      event.intAwayScore === null
    ) {
      continue;
    }

    const homeScore =
      Number(event.intHomeScore);

    const awayScore =
      Number(event.intAwayScore);

    if (
      Number.isNaN(homeScore) ||
      Number.isNaN(awayScore)
    ) {
      continue;
    }

    const isHome =
      event.strHomeTeam.toLowerCase() ===
      teamName.toLowerCase();

    const scored = isHome
      ? homeScore
      : awayScore;

    const conceded = isHome
      ? awayScore
      : homeScore;

    played++;

    goalsFor += scored;
    goalsAgainst += conceded;

    if (scored > conceded) {
      wins++;
    } else if (scored === conceded) {
      draws++;
    } else {
      losses++;
    }
  }

  if (played === 0) {
    return emptyStats(teamName);
  }

  const averageGoalsFor =
    goalsFor / played;

  const averageGoalsAgainst =
    goalsAgainst / played;

  const form =
    ((wins * 3 + draws) /
      (played * 3)) *
    100;

  return {
    name: teamName,
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    averageGoalsFor,
    averageGoalsAgainst,
    form,
  };
}

function emptyStats(
  teamName: string
): TeamStats {
  return {
    name: teamName,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    averageGoalsFor: 1,
    averageGoalsAgainst: 1,
    form: 50,
  };
}

export async function getFixturesToday(): Promise<Event[]> {
  const today =
    new Date().toISOString().split("T")[0];

  const url =
    `${API_URL}/eventsday.php?d=${today}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Erreur matchs: ${response.status}`
    );
  }

  const data: EventsResponse =
    await response.json();

  return data.results ?? [];
}