"use client";

import { useWeatherData } from "@/src/hook/use-weather-data";
import { useAccuWeather } from "@/src/hook/use-accuweather";

import { QuickView } from "@/src/components/weather/quick-view";
import { Outdoor } from "@/src/components/weather/outdoor";
import { Wind } from "@/src/components/weather/wind";
import { Rainfall } from "@/src/components/weather/rainfall";
import { Humidity } from "@/src/components/weather/humidity";
import { Pressure } from "@/src/components/weather/pressure";

import { SunMoon } from "@/src/components/weather/sun-moon";
import { Forecast } from "@/src/components/weather/forecast";

export default function Home() {
    const { data, loading, error, refresh} = useWeatherData();
    const {
        data: sunMoonData,
        dailyData,
        hourlyData,
        loading: sunMoonLoading,
        error: sunMoonError,
        refresh: refreshSunMoon,
    } = useAccuWeather();

    if (loading) {
        return (
            <main className="p-4">
                <p className="text-sm text-muted-foreground">
                    Cargando datos meteorológicos...
                </p>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="p-4">
                <p className="text-sm text-red-500">
                    {error ?? "No se pudieron cargar los datos meteorológicos."}
                </p>

                <button
                    onClick={refresh}
                    className="mt-3 rounded-lg border px-4 py-2 text-sm"
                >
                    Reintentar
                </button>
            </main>
        );
    }

    return (
        <main className="space-y-3 p-4">
            <details open className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Quick View
                </summary>
                <div className="p-4 pt-0">
                    <QuickView data={data} />
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Forecast
                </summary>
                <div className="p-4 pt-0">
                    <Forecast
                        hourlyData={hourlyData}
                        dailyData={dailyData}
                    />
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Wind
                </summary>
                <div className="p-4 pt-0">
                    <Wind data={data} />
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Rainfall
                </summary>
                <div className="p-4 pt-0">
                    <Rainfall data={data} />
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Sun-Moon
                </summary>
                    <div className="p-4 pt-0">
                        {sunMoonLoading && (
                            <p className="text-sm text-muted-foreground">
                                Cargando datos del Sol y la Luna...
                            </p>
                        )}

                        {sunMoonError && (
                            <div className="text-sm text-red-500">
                                <p>{sunMoonError}</p>

                                <button
                                    onClick={refreshSunMoon}
                                    className="mt-2 rounded-lg border px-3 py-2"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {sunMoonData && !sunMoonLoading && (
                            <SunMoon data={sunMoonData} />
                        )}
                    </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Outdoor
                </summary>
                <div className="p-4 pt-0">
                    <Outdoor data={data} />
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Humidity
                </summary>
                <div className="p-4 pt-0">
                    <Humidity data={data} />
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Pressure
                </summary>
                <div className="p-4 pt-0">
                    <Pressure data={data} />
                </div>
            </details>
        </main>
    );
}