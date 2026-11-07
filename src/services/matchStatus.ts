import type { Match } from "../types";

export type MatchStatusCategory = "upcoming" | "live" | "finished" | "unknown";

export function getMatchStatusCategory(match: Match): MatchStatusCategory {
  const status = match.strStatus?.trim().toLowerCase() ?? "";

  if (
    /finished|full time|after extra time|after penalties|ended|complete/.test(status) ||
    ["ft", "aet", "pen"].includes(status)
  ) {
    return "finished";
  }

  if (
    /^(?:1h|2h|ht|et|p|live|in play|in progress|half[- ]?time|extra time|penalt(?:y|ies)(?: shootout)?|break|first half|second half)(?:$|[\s\d])/.test(status) ||
    /^\d+(?:\+\d+)?['’′]$/.test(status)
  ) {
    return "live";
  }

  if (
    ["not started", "scheduled", "upcoming", "ns", "tbd", "time to be defined", "programmé", "programme", "à venir", "a venir"].includes(status)
  ) {
    return "upcoming";
  }

  return "unknown";
}

export function getMatchStatusLabel(match: Match): string {
  switch (getMatchStatusCategory(match)) {
    case "upcoming":
      return "À venir";
    case "live":
      return "En direct";
    case "finished":
      return "Terminé";
    default:
      return match.strStatus?.trim() || "Statut indisponible";
  }
}

export function getActualMatchScore(match: Match): string | null {
  const statusCategory = getMatchStatusCategory(match);
  if (statusCategory !== "live" && statusCategory !== "finished") {
    return null;
  }

  const { intHomeScore, intAwayScore } = match;
  if (
    intHomeScore === null ||
    intHomeScore === undefined ||
    intAwayScore === null ||
    intAwayScore === undefined ||
    intHomeScore === "" ||
    intAwayScore === ""
  ) {
    return null;
  }

  const homeScore = Number(intHomeScore);
  const awayScore = Number(intAwayScore);
  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    return null;
  }

  return `${homeScore} - ${awayScore}`;
}

export function getActualMatchScoreLabel(match: Match): string {
  switch (getMatchStatusCategory(match)) {
    case "live":
      return "Score en direct";
    case "finished":
      return "Résultat réel";
    default:
      return "Score réel";
  }
}
