import json
import unittest
from unittest.mock import patch

import refresh_official_matches as collector


class OfficialMatchCollectorTests(unittest.TestCase):
    def test_extracts_sports_events_from_json_ld_graph(self):
        html = """
        <script type="application/ld+json">
        {"@graph":[{"@type":"SportsEvent","startDate":"2026-07-14T19:00:00Z",
        "homeTeam":{"name":"Équipe A"},"awayTeam":{"name":"Équipe B"}}]}
        </script>
        """

        events = collector.find_sports_events(collector.parse_documents(html))

        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["homeTeam"]["name"], "Équipe A")

    def test_event_requires_a_date_and_two_teams(self):
        source = {"id": "test", "label": "Test", "url": "https://example.test"}

        self.assertIsNone(collector.event_to_match({"homeTeam": {"name": "A"}}, source))

    def test_repairs_mojibake_in_team_names(self):
        self.assertEqual(collector.team_name("MÃ¡laga CF"), "Málaga CF")

    def test_unavailable_page_is_reported_without_fabricated_matches(self):
        source = {"id": "test", "label": "Test", "url": "https://example.test"}
        with patch.object(collector, "fetch", side_effect=OSError("offline")):
            matches, status = collector.collect_official_page(source)

        self.assertEqual(matches, [])
        self.assertEqual(status["status"], "unavailable")

    def test_matching_snapshot_preserves_publication_timestamp(self):
        snapshot = {
            "updatedAt": "2026-07-14T12:00:00+00:00",
            "coverage": "partial",
            "sources": [
                {
                    "id": "premier-league", "label": "Premier League",
                    "url": "https://www.premierleague.com/", "status": "ok",
                    "matchCount": 0,
                },
                {
                    "id": "page", "label": "Page", "url": "https://example.test",
                    "status": "no_public_match_data", "matchCount": 0, "detail": "no data",
                },
            ],
            "matches": [],
            "teamStats": {},
        }
        with patch.object(collector, "OUTPUT") as output:
            output.exists.return_value = True
            output.read_text.return_value = json.dumps(snapshot)
            with patch.object(collector, "collect_official_page", return_value=([], {
                "id": "page", "label": "Page", "url": "https://example.test",
                "status": "no_public_match_data", "matchCount": 0,
                "detail": "no data",
            })), patch.object(collector, "collect_premier_league", return_value=([], {
                "id": "premier-league", "label": "Premier League",
                "url": "https://www.premierleague.com/", "status": "ok", "matchCount": 0,
            }, {})), patch.object(collector, "OFFICIAL_PAGES", [{}]):
                result = collector.main()

        self.assertEqual(result, 0)
        output.write_text.assert_not_called()


if __name__ == "__main__":
    unittest.main()
