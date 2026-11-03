import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface QuickViewProps {
    data: WeatherDashboardData;
}

function formatValue(value: number | null | undefined, decimals = 1): string {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(decimals);
}

function celsiusToFahrenheit(value: number | null): number | null {
    return value === null ? null : (value * 9) / 5 + 32;
}

function kmhToMph(value: number | null): number | null {
    return value === null ? null : value / 1.609344;
}

function mmToInches(value: number | null): number | null {
    return value === null ? null : value / 25.4;
}

function hpaToInHg(value: number | null): number | null {
    return value === null ? null : value / 33.8638866667;
}

function TemperatureRange({
    high,
    low,
}: {
    high: number | null;
    low: number | null;
}) {
    return (
        <span>
            {formatValue(celsiusToFahrenheit(high))}°F /{" "}
            {formatValue(celsiusToFahrenheit(low))}°F
        </span>
    );
}

function QuickSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                {title}
            </h3>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

function QuickMetric({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <strong className="text-sm font-semibold tabular-nums">
                {value}
            </strong>
        </div>
    );
}

export function QuickView({ data }: QuickViewProps) {
    const { outdoor, wind, rainfall, pressure, humidity, historical } = data;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick View</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QuickSection title="Outdoor">
                    <QuickMetric
                        label="Temperature"
                        value={`${formatValue(celsiusToFahrenheit(outdoor.temperature))}°F`}
                    />
                    <QuickMetric 
                        label="From Yesterday" 
                        value={
                            data.changes.temperatureFromYesterday === null
                                ? "—"
                                : `${data.changes.temperatureFromYesterday > 0 ? "+" : ""}${formatValue(data.changes.temperatureFromYesterday * 9 / 5)}°F`
                            }
                    />
                    <QuickMetric
                        label="Feels Like"
                        value={`${formatValue(celsiusToFahrenheit(outdoor.feelsLike))}°F`}
                    />
                    <QuickMetric
                        label="Today's High/Low"
                        value={
                            <TemperatureRange
                                high={historical.today.high}
                                low={historical.today.low}
                            />
                        }
                    />
                    <QuickMetric
                        label="Yesterday's High/Low"
                        value={
                            <TemperatureRange
                                high={historical.yesterday.high}
                                low={historical.yesterday.low}
                            />
                        }
                    />
                    <QuickMetric
                        label="Weekly High/Low"
                        value={
                            <TemperatureRange
                                high={historical.weekly.high}
                                low={historical.weekly.low}
                            />
                        }
                    />
                    <QuickMetric
                        label="Monthly High/Low"
                        value={
                            <TemperatureRange
                                high={historical.monthly.high}
                                low={historical.monthly.low}
                            />
                        }
                    />
                    <QuickMetric
                        label="Yearly High/Low"
                        value={
                            <TemperatureRange
                                high={historical.yearly.high}
                                low={historical.yearly.low}
                            />
                        }
                    />
                </QuickSection>

                <QuickSection title="Wind">
                    <QuickMetric
                        label="Speed"
                        value={`${formatValue(kmhToMph(wind.speed))} mph`}
                    />
                    <QuickMetric
                        label="Gust"
                        value={`${formatValue(kmhToMph(wind.gust))} mph`}
                    />
                    <QuickMetric
                        label="Max Daily Gust"
                        value={`${formatValue(kmhToMph(wind.maxDailyGust))} mph`}
                    />
                    <QuickMetric
                        label="Direction"
                        value={wind.direction === null ? "—" : `${Math.round(wind.direction)}°`}
                    />
                    <QuickMetric
                        label="Avg Direction (10 mins)"
                        value={
                            wind.averageDirection === null
                                ? "—"
                                : `${Math.round(wind.averageDirection)}°`
                        }
                    />
                </QuickSection>

                <QuickSection title="Rain">
                    <QuickMetric
                        label="Rate"
                        value={`${formatValue(mmToInches(rainfall.hourly), 2)} in/hr`}
                    />
                    <QuickMetric
                        label="Daily"
                        value={`${formatValue(mmToInches(rainfall.daily), 2)} in`}
                    />
                    <QuickMetric
                        label="Weekly"
                        value={`${formatValue(mmToInches(rainfall.weekly), 2)} in`}
                    />
                    <QuickMetric
                        label="Event"
                        value={`${formatValue(mmToInches(rainfall.event), 2)} in`}
                    />
                    <QuickMetric
                        label="Monthly"
                        value={`${formatValue(mmToInches(rainfall.monthly), 2)} in`}
                    />
                    <QuickMetric
                        label="Yearly"
                        value={`${formatValue(mmToInches(rainfall.yearly), 2)} in`}
                    />
                    <QuickMetric
                        label="Total"
                        value={`${formatValue(mmToInches(rainfall.total), 2)} in`}
                    />
                </QuickSection>

                <div className="space-y-4">
                    <QuickSection title="Pressure">
                        <QuickMetric
                            label="Relative"
                            value={`${formatValue(hpaToInHg(pressure.relative), 2)} inHg`}
                        />
                        <QuickMetric 
                            label="Rate" 
                            value={
                                data.changes.pressureRate === null
                                    ? "—"
                                    : `${data.changes.pressureRate > 0 ? "+" : ""}${formatValue(data.changes.pressureRate / 33.8638866667, 3)} inHg/hr`
                            }
                        />
                    </QuickSection>

                    <QuickSection title="Humidity">
                        <QuickMetric
                            label="Humidity"
                            value={
                                humidity.current === null
                                    ? "—"
                                    : `${formatValue(humidity.current, 0)}%`
                            }
                        />
                        <QuickMetric 
                        label="From Yesterday" 
                        value={
                            data.changes.humidityFromYesterday === null
                                ? "—"
                                : `${data.changes.humidityFromYesterday > 0 ? "+" : ""}${formatValue(data.changes.humidityFromYesterday, 0)}%`
                        }
                        />
                    </QuickSection>
                </div>
            </div>
        </div>
    );
}