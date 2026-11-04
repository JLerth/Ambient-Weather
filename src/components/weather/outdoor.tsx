import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface OutdoorProps {
    data: {
        outdoor: {
            temperature: number | null;
            feelsLike: number | null;
            dewPoint: number | null;
        };
        changes: {
            temperatureFromYesterday: number | null;
        };
    };
}

function formatValue(value: number | null, decimals = 1): string {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(decimals);
}

export function Outdoor({ data }: OutdoorProps) {
    const { outdoor, changes } = data;

    return (
        <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Outdoor
            </h2>

            <div className="space-y-5">
                <div className="text-center">
                    <p className="text-4xl font-semibold tabular-nums">
                        {formatValue(outdoor.temperature)}°
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Dew Point
                        </p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {formatValue(outdoor.dewPoint)}°C
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            From Yesterday
                        </p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {changes.temperatureFromYesterday === null
                                ? "—"
                                : `${changes.temperatureFromYesterday > 0 ? "+" : ""}${formatValue(changes.temperatureFromYesterday)}°C`}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Feels Like
                        </p>
                        <p className="mt-1 text-lg font-semibold tabular-nums">
                            {formatValue(outdoor.feelsLike)}°C
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}