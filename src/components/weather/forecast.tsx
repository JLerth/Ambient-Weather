import type {
    AccuWeatherDailyResponse,
    AccuWeatherHourlyResponse,
} from "@/src/types/accuweather";

interface ForecastProps {
    hourlyData: AccuWeatherHourlyResponse;
    dailyData: AccuWeatherDailyResponse | null;
}

function formatTime(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

function formatWeekday(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    const weekday = new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        weekday: "long",
    }).format(date).toLowerCase();

    const weekdays: Record<string, string> = {
        lunes: "L",
        martes: "M",
        miércoles: "Mi",
        jueves: "J",
        viernes: "V",
        sábado: "S",
        domingo: "D",
    };

    return weekdays[weekday] ?? "—";
}

export function Forecast({ hourlyData, dailyData }: ForecastProps) {
    const hourlyForecast = hourlyData.slice(0, 12);
    const dailyForecast = dailyData?.DailyForecasts ?? [];

    return (
        <section className="space-y-4">

            <h2>Pronóstico por horas</h2>

            <div className="flex w-full flex-nowrap gap-6 overflow-x-auto">
                {hourlyForecast.length > 0 ? (
                    hourlyForecast.map((hour, index) => (
                        <div
                            key={hour.DateTime}
                            className="min-w-20 shrink-0 border-r pr-6 text-center last:border-r-0"
                        >
                            <p>
                                {index === 0 ? "Ahora" : formatTime(hour.DateTime)}
                            </p>
                            <p>{hour.Temperature.Value} °C</p>

                            <p>{hour.IconPhrase}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No hay pronóstico por horas disponible.
                    </p>
                )}
            </div>

            <h2>Pronóstico de 7 días</h2>

            <div className="flex w-full flex-nowrap gap-6 overflow-x-auto">
                {dailyForecast.length > 0 ? (
                    dailyForecast.map((day) => (
                        <div
                            key={day.Date}
                            className="min-w-28 shrink-0 border-r pr-6 last:border-r-0"
                        >
                            <p>{formatWeekday(day.Date)}</p>
                            <p>Máxima: {day.Temperature.Maximum.Value} °C</p>
                            <p>Mínima: {day.Temperature.Minimum.Value} °C</p>
                            <p>Día: {day.Day.PrecipitationProbability ?? "—"}%</p>
                            <p>Noche: {day.Night.PrecipitationProbability ?? "—"}%</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No hay pronóstico diario disponible.
                    </p>
                )}
            </div>
        </section>
    );
}