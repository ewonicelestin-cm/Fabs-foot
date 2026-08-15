const API_URL = "https://api.football-data.org/v4";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const dateFrom =
      url.searchParams.get("dateFrom") ||
      new Date().toISOString().slice(0, 10);

    const dateTo =
      url.searchParams.get("dateTo") ||
      dateFrom;

    const competition = url.searchParams.get("competition");

    const params = new URLSearchParams({
      dateFrom,
      dateTo,
    });

    if (competition) {
      params.set("competitions", competition);
    }

    const response = await fetch(
      `${API_URL}/matches?${params.toString()}`,
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY || "",
        },
      }
    );

    if (!response.ok) {
      return Response.json(
        {
          error: "Football-Data API error",
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return Response.json(data, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Impossible de récupérer les matchs.",
      },
      { status: 500 }
    );
  }
}
