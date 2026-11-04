import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface WindProps {
    data: Pick<WeatherDashboardData, "wind">;
}

function formatValue(value: number | null, decimals = 1): string {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(decimals);
}

function getWindDirection(degrees: number | null): string {
    if (degrees === null || !Number.isFinite(degrees)) {
        return "—";
    }

    const directions = [
        "N", "NNE", "NE", "ENE",
        "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW",
        "W", "WNW", "NW", "NNW",
    ];

    return directions[Math.round(degrees / 22.5) % 16];
}

export function Wind({ data }: WindProps) {
    const { wind } = data;

    return (
        <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Wind
            </h2>

            <div className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        10 Minute
                    </p>

                    <p className="mt-1 text-xl font-semibold">
                        {getWindDirection(wind.averageDirection)}
                    </p>

                    <p className="mt-2 text-4xl font-semibold tabular-nums">
                        {formatValue(wind.speed)} km/h
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                        Today's Peak:
                    </p>

                    <p className="text-lg font-semibold tabular-nums">
                        {formatValue(wind.maxDailyGust)} km/h
                    </p>
                </div>

                <div className="grid grid-cols-2 border-t pt-3 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            From
                        </p>
                        <p className="text-lg font-semibold">
                            {getWindDirection(wind.direction)}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Gusts
                        </p>
                        <p className="text-lg font-semibold tabular-nums">
                            {formatValue(wind.gust)} km/h
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}