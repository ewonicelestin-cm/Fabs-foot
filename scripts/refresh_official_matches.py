#!/usr/bin/env python3
"""Refresh the static match snapshot from public, unauthenticated official sources."""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "data" / "official-matches.json"
USER_AGENT = "FabFootOfficialSchedule/1.0 (+https://github.com/ewonicelestin-cm/Fabs-foot)"
UTC_NOW = datetime.now(timezone.utc)
DATE_FROM = UTC_NOW.date()
DATE_TO = DATE_FROM + timedelta(days=1)

OFFICIAL_PAGES = [
    {
        "id": "laliga",
        "label": "LaLiga",
        "url": "https://www.laliga.com/en-GB/laliga-easports/results",
    },
    {
        "id": "bundesliga",
        "label": "Bundesliga",
        "url": "https://www.bundesliga.com/en/bundesliga/matchday",
    },
    {
        "id": "ligue-1",
        "label": "Ligue 1",
        "url": "https://ligue1.com/en/competitions/ligue1-mcdonalds/fixtures-results",
    },
    {
        "id": "serie-a",
        "label": "Serie A",
        "url": "https://en.legaseriea.it/serie-a",
    },
    {
        "id": "fifa-world-cup",
        "label": "Coupe du monde FIFA",
        "url": "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/match-center",
    },
    {
        "id": "fifa-world-cup-qualifiers",
        "label": "Qualifications Coupe du monde FIFA",
        "url": "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/qualifiers",
    },
    {
        "id": "euro-qualifiers",
        "label": "Qualifications Euro",
        "url": "https://www.uefa.com/european-qualifiers/fixtures-results/",
    },
    {
        "id": "uefa-nations-league",
        "label": "UEFA Nations League",
        "url": "https://www.uefa.com/uefanationsleague/fixtures-results/",
    },
    {
        "id": "afcon",
        "label": "Coupe d’Afrique des Nations",
        "url": "https://www.cafonline.com/afcon2025/",
    },
    {
        "id": "copa-america",
        "label": "Copa América",
        "url": "https://copaamerica.com/en/",
    },
    {
        "id": "gold-cup",
        "label": "Gold Cup",
        "url": "https://www.concacaf.com/",
    },
    {
        "id": "asian-cup",
        "label": "Coupe d’Asie AFC",
        "url": "https://www.the-afc.com/en/",
    },
]


class JsonLdParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._inside_json_ld = False
        self._parts: list[str] = []
        self.documents: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "script" and dict(attrs).get("type") == "application/ld+json":
            self._inside_json_ld = True
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._inside_json_ld:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._inside_json_ld:
            self.documents.append("".join(self._parts))
            self._inside_json_ld = False


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=20) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status}")
        return response.read()


def parse_documents(html: str) -> list[object]:
    parser = JsonLdParser()
    parser.feed(html)
    documents = []
    for raw in parser.documents:
        try:
            documents.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return documents


def find_sports_events(value: object) -> list[dict]:
    found: list[dict] = []
    if isinstance(value, dict):
        types = value.get("@type", [])
        if isinstance(types, str):
            types = [types]
        if "SportsEvent" in types:
            found.append(value)
        for nested in value.values():
            found.extend(find_sports_events(nested))
    elif isinstance(value, list):
        for nested in value:
            found.extend(find_sports_events(nested))
    return found


def parse_event_date(value: object) -> datetime | None:
    if not isinstance(value, str):
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def team_name(value: object) -> str | None:
    if isinstance(value, dict):
        name = value.get("name")
        return repair_text(name.strip()) if isinstance(name, str) and name.strip() else None
    if isinstance(value, str) and value.strip():
        return repair_text(value.strip())
    return None


def repair_text(value: str) -> str:
    if "Ã" not in value and "â€" not in value:
        return value
    try:
        return value.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value


def event_status(value: object) -> str:
    status = value if isinstance(value, str) else ""
    normalized = status.lower()
    if "completed" in normalized or "finished" in normalized:
        return "Match Finished"
    if "inprogress" in normalized or "in_progress" in normalized or "live" in normalized:
        return "In Play"
    return "Not Started"


def event_to_match(event: dict, source: dict) -> dict | None:
    kickoff = parse_event_date(event.get("startDate"))
    home = team_name(event.get("homeTeam"))
    away = team_name(event.get("awayTeam"))
    if kickoff is None or home is None or away is None:
        return None

    match = {
        "idEvent": f"{source['id']}-{event.get('identifier') or kickoff.isoformat()}-{home}-{away}",
        "strHomeTeam": home,
        "strAwayTeam": away,
        "dateEvent": kickoff.date().isoformat(),
        "strTime": kickoff.strftime("%H:%M UTC"),
        "strCompetition": source["label"],
        "strLeague": source["label"],
        "strCountry": "",
        "strStatus": event_status(event.get("eventStatus")),
        "sourceUrl": source["url"],
    }

    result = event.get("result")
    if isinstance(result, dict):
        home_score = result.get("homeTeamScore")
        away_score = result.get("awayTeamScore")
        if isinstance(home_score, int) and isinstance(away_score, int):
            match["intHomeScore"] = home_score
            match["intAwayScore"] = away_score
    return match


def collect_official_page(source: dict) -> tuple[list[dict], dict]:
    try:
        html = fetch(source["url"]).decode("utf-8", "replace")
    except (OSError, urllib.error.URLError, RuntimeError) as error:
        return [], {**source, "status": "unavailable", "matchCount": 0, "detail": str(error)}

    matches = []
    valid_events = 0
    for document in parse_documents(html):
        for event in find_sports_events(document):
            match = event_to_match(event, source)
            if match:
                valid_events += 1
                if DATE_FROM <= datetime.fromisoformat(match["dateEvent"]).date() <= DATE_TO:
                    matches.append(match)

    if valid_events:
        return matches, {**source, "status": "ok", "matchCount": len(matches)}
    return [], {
        **source,
        "status": "no_public_match_data",
        "matchCount": 0,
        "detail": "La page ne publie pas de matchs lisibles dans les données structurées.",
    }


def collect_premier_league() -> tuple[list[dict], dict, dict[str, dict]]:
    source = {
        "id": "premier-league",
        "label": "Premier League",
        "url": "https://www.premierleague.com/",
    }
    try:
        seasons_url = "https://api.premierleague.com/football/competitions/1/compseasons?page=0&pageSize=10"
        seasons_data = json.loads(fetch(seasons_url))
        seasons = seasons_data.get("content", [])
        if not seasons:
            raise RuntimeError("Aucune saison publiée par le flux officiel.")
        season_id = int(seasons[0]["id"])

        fixtures_url = (
            "https://api.premierleague.com/football/fixtures?"
            + urllib.parse.urlencode(
                {"comp": 1, "compSeasons": season_id, "page": 0, "pageSize": 500}
            )
        )
        fixtures_data = json.loads(fetch(fixtures_url))
        raw_fixtures = fixtures_data.get("content", [])
        if not raw_fixtures:
            raise RuntimeError("Le flux officiel n’a renvoyé aucune rencontre.")
    except (KeyError, TypeError, ValueError, OSError, urllib.error.URLError, RuntimeError) as error:
        return [], {**source, "status": "unavailable", "matchCount": 0, "detail": str(error)}, {}

    all_matches = []
    results_by_team: dict[str, list[tuple[int, int, int]]] = {}
    for fixture in raw_fixtures:
        teams = fixture.get("teams", [])
        kickoff = fixture.get("kickoff", {})
        if len(teams) != 2 or not isinstance(kickoff.get("millis"), (int, float)):
            continue
        kickoff_date = datetime.fromtimestamp(kickoff["millis"] / 1000, timezone.utc)
        status = fixture.get("status", "")
        scores = [team.get("score") for team in teams]
        completed = status in {"C", "F", "FT", "AET", "PEN"}
        home, away = teams[0]["team"].get("name"), teams[1]["team"].get("name")
        if not home or not away:
            continue

        if completed and all(isinstance(score, (int, float)) for score in scores):
            home_score, away_score = int(scores[0]), int(scores[1])
            results_by_team.setdefault(home, []).append((kickoff["millis"], home_score, away_score))
            results_by_team.setdefault(away, []).append((kickoff["millis"], away_score, home_score))
        else:
            home_score = away_score = None

        if kickoff_date.date() < DATE_FROM or kickoff_date.date() > DATE_TO:
            continue
        if completed:
            display_status = "Match Finished"
        elif status == "U":
            display_status = "Not Started"
        elif status in {"L", "1H", "2H", "HT", "ET"}:
            display_status = "In Play"
        elif status == "P":
            display_status = "Postponed"
        elif status == "S":
            display_status = "Suspended"
        else:
            display_status = "Status unavailable"
        all_matches.append(
            {
                "idEvent": f"pl-{int(fixture['id'])}",
                "strHomeTeam": home,
                "strAwayTeam": away,
                "dateEvent": kickoff_date.date().isoformat(),
                "strTime": kickoff_date.strftime("%H:%M UTC"),
                "strCompetition": source["label"],
                "strLeague": source["label"],
                "strCountry": "England",
                "strStatus": display_status,
                "intHomeScore": home_score,
                "intAwayScore": away_score,
                "sourceUrl": source["url"],
            }
        )

    stats = {}
    for name, results in results_by_team.items():
        played = sorted(results)[-10:]
        wins = sum(for_goals > against_goals for _, for_goals, against_goals in played)
        draws = sum(for_goals == against_goals for _, for_goals, against_goals in played)
        losses = len(played) - wins - draws
        stats[name.casefold()] = {
            "played": len(played),
            "wins": wins,
            "draws": draws,
            "losses": losses,
            "goalsFor": sum(for_goals for _, for_goals, _ in played),
            "goalsAgainst": sum(against_goals for _, _, against_goals in played),
        }

    return all_matches, {**source, "status": "ok", "matchCount": len(all_matches)}, stats


def main() -> int:
    with ThreadPoolExecutor(max_workers=8) as executor:
        page_results = list(executor.map(collect_official_page, OFFICIAL_PAGES))
    page_matches = [match for matches, _ in page_results for match in matches]
    page_sources = [source for _, source in page_results]
    pl_matches, pl_source, team_stats = collect_premier_league()

    all_matches = {}
    for match in [*pl_matches, *page_matches]:
        all_matches[match["idEvent"]] = match

    sources = [pl_source, *page_sources]
    successful_sources = sum(source["status"] == "ok" for source in sources)
    if successful_sources == 0:
        print("No official source returned usable match data; keeping the previous snapshot.", file=sys.stderr)
        return 1

    snapshot = {
        "updatedAt": UTC_NOW.isoformat(),
        "coverage": "partial" if any(source["status"] != "ok" for source in sources) else "complete",
        "sources": sources,
        "matches": sorted(
            all_matches.values(),
            key=lambda match: (match["dateEvent"], match["strTime"], match["strLeague"]),
        ),
        "teamStats": team_stats,
    }
    if OUTPUT.exists():
        try:
            previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = None
        if isinstance(previous, dict):
            previous_content = {key: value for key, value in previous.items() if key != "updatedAt"}
            current_content = {key: value for key, value in snapshot.items() if key != "updatedAt"}
            if previous_content == current_content:
                print("Official source data is unchanged; keeping the existing publication timestamp.")
                return 0

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Published {len(snapshot['matches'])} matches from {successful_sources}/{len(sources)} "
        f"official sources to {OUTPUT.relative_to(ROOT)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
