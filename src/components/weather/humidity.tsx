import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface HumidityProps {
    data: {
        humidity: {
            current: number | null;
        };
        changes: {
            humidityFromYesterday: number | null;
        };
    };
}

function formatValue(value: number | null): string {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(0);
}

export function Humidity({ data }: HumidityProps) {
    const { humidity, changes } = data;

    return (
        <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Humidity
            </h2>

            <div className="space-y-4">
                <p className="text-center text-4xl font-semibold tabular-nums">
                    {formatValue(humidity.current)}%
                </p>

                <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm text-muted-foreground">
                        From Yesterday
                    </span>

                    <span className="text-sm font-semibold tabular-nums">
                        {changes.humidityFromYesterday === null
                            ? "—"
                            : `${changes.humidityFromYesterday > 0 ? "+" : ""}${formatValue(changes.humidityFromYesterday)}%`}
                    </span>
                </div>
            </div>
        </section>
    );
}