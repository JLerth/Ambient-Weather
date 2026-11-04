import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface QuickViewProps {
    current: {
        outdoor: {
            temperature: number | null;
            feelsLike: number | null;
        };
        wind: {
            speed: number | null;
            gust: number | null;
            maxDailyGust: number | null;
            direction: number | null;
            averageDirection: number | null;
        };
        rainfall: {
            hourly: number | null;
            daily: number | null;
            weekly: number | null;
            event: number | null;
            monthly: number | null;
            yearly: number | null;
            total: number | null;
        };
        pressure: {
            relative: number | null;
        };
        humidity: {
            current: number | null;
        };
        historical: {
            today: { high: number | null; low: number | null };
        };
    };
    historical: {
        historical: {
            yesterday: { high: number | null; low: number | null };
            weekly: { high: number | null; low: number | null };
            monthly: { high: number | null; low: number | null };
            yearly: { high: number | null; low: number | null };
        };
    } | null;
    yesterday: {
        temperatureFromYesterday: number | null;
        humidityFromYesterday: number | null;
    } | null;
    pressureChange: {
        pressureRate: number | null;
    } | null;
}

function formatValue(value: number | null | undefined, decimals = 1): string {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return "—";
    }

    return value.toFixed(decimals);
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
            {formatValue(high)}°C / {formatValue(low)}°C
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

export function QuickView({
    current,
    historical,
    yesterday,
    pressureChange,
}: QuickViewProps) {
    const { outdoor, wind, rainfall, pressure, humidity } = current;

    const historicalData = historical?.historical;

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick View</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QuickSection title="Outdoor">
                    <QuickMetric
                        label="Temperature"
                        value={`${formatValue(outdoor.temperature)}°C`}
                    />
                    <QuickMetric 
                        label="From Yesterday" 
                        value={
                            yesterday?.temperatureFromYesterday == null
                                ? "—"
                                : `${yesterday.temperatureFromYesterday > 0 ? "+" : ""}${formatValue(yesterday.temperatureFromYesterday)}°C`
                        }
                    />
                    <QuickMetric
                        label="Feels Like"
                        value={`${formatValue(outdoor.feelsLike)}°C`}
                    />
                    <QuickMetric
                        label="Today's High/Low"
                        value={
                            <TemperatureRange
                                high={current.historical.today.high}
                                low={current.historical.today.low}
                            />
                        }
                    />
                    <QuickMetric
                        label="Yesterday's High/Low"
                        value={
                            <TemperatureRange
                                high={historicalData?.yesterday.high ?? null}
                                low={historicalData?.yesterday.low ?? null}
                            />
                        }
                    />
                    <QuickMetric
                        label="Weekly High/Low"
                        value={
                            <TemperatureRange
                                high={historicalData?.weekly.high ?? null}
                                low={historicalData?.weekly.low ?? null}
                            />
                        }
                    />
                    <QuickMetric
                        label="Monthly High/Low"
                        value={
                            <TemperatureRange
                                high={historicalData?.monthly.high ?? null}
                                low={historicalData?.monthly.low ?? null}
                            />
                        }
                    />
                    <QuickMetric
                        label="Yearly High/Low"
                        value={
                            <TemperatureRange
                                high={historicalData?.yearly.high ?? null}
                                low={historicalData?.yearly.low ?? null}
                            />
                        }
                    />
                </QuickSection>

                <QuickSection title="Wind">
                    <QuickMetric
                        label="Speed"
                        value={`${formatValue(wind.speed)} km/h`}
                    />
                    <QuickMetric
                        label="Gust"
                        value={`${formatValue(wind.gust)} km/h`}
                    />
                    <QuickMetric
                        label="Max Daily Gust"
                        value={`${formatValue(wind.maxDailyGust)} km/h`}
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
                        value={`${formatValue(rainfall.hourly, 2)} mm/h`}
                    />
                    <QuickMetric
                        label="Daily"
                        value={`${formatValue(rainfall.daily, 2)} mm`}
                    />
                    <QuickMetric
                        label="Weekly"
                        value={`${formatValue(rainfall.weekly, 2)} mm`}
                    />
                    <QuickMetric
                        label="Event"
                        value={`${formatValue(rainfall.event, 2)} mm`}
                    />
                    <QuickMetric
                        label="Monthly"
                        value={`${formatValue(rainfall.monthly, 2)} mm`}
                    />
                    <QuickMetric
                        label="Yearly"
                        value={`${formatValue(rainfall.yearly, 2)} mm`}
                    />
                    <QuickMetric
                        label="Total"
                        value={`${formatValue(rainfall.total, 2)} mm`}
                    />
                </QuickSection>

                <div className="space-y-4">
                    <QuickSection title="Pressure">
                        <QuickMetric
                            label="Relative"
                            value={`${formatValue(pressure.relative, 1)} hPa`}
                        />
                        <QuickMetric 
                            label="Rate" 
                            value={
                                pressureChange?.pressureRate == null
                                    ? "—"
                                    : `${pressureChange.pressureRate > 0 ? "+" : ""}${formatValue(pressureChange.pressureRate, 2)} hPa/hr`
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
                            yesterday?.humidityFromYesterday == null
                                ? "—"
                                : `${yesterday.humidityFromYesterday > 0 ? "+" : ""}${formatValue(yesterday.humidityFromYesterday, 0)}%`
                        }
                        />
                    </QuickSection>
                </div>
            </div>
        </div>
    );
}