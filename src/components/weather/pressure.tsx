import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface PressureProps {
    data: {
        pressure: {
            relative: number | null;
        };
        changes: {
            pressureRate: number | null;
        };
    };
}

function formatValue(value: number | null, decimals = 1): string {
    if (value === null || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(decimals);
}

export function Pressure({ data }: PressureProps) {
    const { pressure, changes } = data;

    return (
        <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Pressure
            </h2>

            <div className="space-y-5">
                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        Pressure Rate
                    </p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">
                        {changes.pressureRate === null
                            ? "—"
                            : `${formatValue(changes.pressureRate)} hPa/h`}
                    </p>
                </div>

                <div className="text-center border-t pt-4">
                    <p className="text-xs text-muted-foreground">
                        Pressure Gauge
                    </p>
                    <p className="mt-1 text-4xl font-semibold tabular-nums">
                        {formatValue(pressure.relative)} hPa
                    </p>
                </div>
            </div>
        </section>
    );
}