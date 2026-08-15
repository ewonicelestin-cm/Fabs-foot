export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const today = new Date();

    const dateFrom = today.toISOString().slice(0, 10);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateTo = tomorrow.toISOString().slice(0, 10);

    const competitions = [
      "PL",
      "PD",
      "SA",
      "BL1",
      "FL1",
      "CL",
    ];

    const results = [];

    for (const competition of competitions) {
      const response = await fetch(
        `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            "X-Auth-Token":
              process.env.FOOTBALL_DATA_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        results.push({
          competition,
          success: false,
          status: response.status,
        });

        continue;
      }

      const data = await response.json();

      results.push({
        competition,
        success: true,
        matches: data.matches?.length || 0,
      });
    }

    return Response.json({
      success: true,
      updatedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: "Erreur pendant la synchronisation.",
      },
      { status: 500 }
    );
  }
}
