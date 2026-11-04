import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface RainfallProps {
    data: Pick<WeatherDashboardData, "rainfall" | "raw">;
}

function formatValue(value: number | null, decimals = 2): string {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(decimals);
}

export function Rainfall({ data }: RainfallProps) {
    const { rainfall, raw } = data;

    const metrics = [
        { label: "Rate", value: rainfall.hourly, unit: "mm/h" },
        { label: "Day", value: rainfall.daily, unit: "mm" },
        { label: "Event", value: rainfall.event, unit: "mm" },
        { label: "Week", value: rainfall.weekly, unit: "mm" },
        { label: "Month", value: rainfall.monthly, unit: "mm" },
        { label: "Year", value: rainfall.yearly, unit: "mm" },
        { label: "Total", value: rainfall.total, unit: "mm" },
    ];

    return (
        <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Rainfall
            </h2>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
                {metrics.map((metric) => (
                    <div key={metric.label}>
                        <p className="text-xl font-semibold tabular-nums">
                            {formatValue(metric.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {metric.label} ({metric.unit})
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-5 border-t pt-3 text-center">
                <span className="text-sm text-muted-foreground">
                    Last Rainfall:{" "}
                </span>
                <span className="text-sm font-semibold">
                    {raw.lastRain ?? "—"}
                </span>
            </div>
        </section>
    );
}