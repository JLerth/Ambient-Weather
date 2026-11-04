import type { AccuWeatherDailyForecast } from "@/src/types/accuweather";

interface SunMoonProps {
    data: AccuWeatherDailyForecast;
}

function formatTime(value: string | null | undefined): string {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        hourCycle: "h23",
    }).format(date);
}

function formatDayLength(rise: string, set: string): string {
    const sunrise = new Date(rise);
    const sunset = new Date(set);

    if (
        Number.isNaN(sunrise.getTime()) ||
        Number.isNaN(sunset.getTime())
    ) {
        return "—";
    }

    const totalMinutes = Math.round(
        (sunset.getTime() - sunrise.getTime()) / 60000
    );

    if (totalMinutes < 0) return "—";

    const wholeHours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${wholeHours} h ${minutes} min`;
}

function formatMoonPhase(phase: string): string {
    const phases: Record<string, string> = {
        New: "Luna nueva",
        WaxingCrescent: "Luna creciente",
        First: "Cuarto creciente",
        WaxingGibbous: "Gibosa creciente",
        Full: "Luna llena",
        WaningGibbous: "Gibosa menguante",
        Last: "Cuarto menguante",
        WaningCrescent: "Luna menguante",
    };

    return phases[phase] ?? phase;
}

export function SunMoon({ data }: SunMoonProps) {
    const { Sun, Moon} = data;

    return (
        <section className="rounded-xl border p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                Sol y Luna
            </h2>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">
                        Duración de luz solar
                    </p>
                    <p className="mt-1 text-xl font-semibold tabular-nums">
                        {formatDayLength(Sun.Rise, Sun.Set)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">
                        Fase lunar
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                        {formatMoonPhase(Moon.Phase)}
                    </p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                    <p className="text-xs text-muted-foreground">
                        Amanecer
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                        {formatTime(Sun.Rise)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">
                        Atardecer
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                        {formatTime(Sun.Set)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">
                        Salida de la Luna
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                        {formatTime(Moon.Rise)}
                    </p>
                </div>

                <div>
                    <p className="text-xs text-muted-foreground">
                        Puesta de la Luna
                    </p>
                    <p className="mt-1 font-semibold tabular-nums">
                        {formatTime(Moon.Set)}
                    </p>
                </div>
            </div>
        </section>
    );
}