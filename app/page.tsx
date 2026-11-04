"use client";
import { useState } from "react";

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
    const {
        currentData: data,
        historicalData,
        yesterdayData,
        pressureChangeData,
        loading,
        currentError,
        historicalError,
        yesterdayError,
        pressureChangeError,
        retryFailed,
    } = useWeatherData();

    const {
        data: sunMoonData,
        dailyData,
        hourlyData,
        loading: sunMoonLoading,
        dailyError,
        hourlyError,
        retryFailed: retryFailedSunMoon,
    } = useAccuWeather();

    const [retrying, setRetrying] = useState(false);

    const ambientHasError = Boolean(
        currentError ||
        historicalError ||
        yesterdayError ||
        pressureChangeError
    );

    const handleRetry = async () => {
        if (retrying) return;

        setRetrying(true);

        try {
            const tasks: Promise<void>[] = [];

            // Ambient Weather: únicamente los bloques fallidos.
            if (ambientHasError) {
                tasks.push(retryFailed());
            }

            // AccuWeather: únicamente los bloques fallidos.
            if (dailyError || hourlyError) {
                tasks.push(retryFailedSunMoon());
            }

            await Promise.all(tasks);
        } finally {
            setRetrying(false);
        }
    };

    return (
        <main className="space-y-3 p-4">
            {ambientHasError && (
                <div className="rounded-lg border border-red-500/30 p-3 text-sm text-red-500">
                    <p className="font-semibold">
                        Problemas al actualizar Ambient Weather:
                    </p>

                    {currentError && <p>Datos actuales: {currentError}</p>}
                    {historicalError && <p>Históricos: {historicalError}</p>}
                    {yesterdayError && <p>Datos de ayer: {yesterdayError}</p>}
                    {pressureChangeError && <p>Cambio de presión: {pressureChangeError}</p>}

                    <p>Se conservan los últimos datos disponibles.</p>
                </div>
            )}
            {(dailyError || hourlyError) && (
                <div className="rounded-lg border border-red-500/30 p-3 text-sm text-red-500">
                    <p>Problemas al actualizar AccuWeather:</p>

                    {dailyError && <p>{dailyError}</p>}
                    {hourlyError && <p>{hourlyError}</p>}

                    <p>Se muestran los últimos datos disponibles.</p>
                </div>
            )}

            {(ambientHasError || dailyError || hourlyError) && (
                <button
                    type="button"
                    onClick={handleRetry}
                    disabled={retrying}
                    className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
                >
                    {retrying ? "Reintentando..." : "Reintentar"}
                </button>
            )}

            <details open className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Quick View
                </summary>
                <div className="p-4 pt-0">
                    {data ? (
                        <QuickView
                            current={data}
                            historical={historicalData}
                            yesterday={yesterdayData}
                            pressureChange={pressureChangeData}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Cargando datos meteorológicos..."
                                : "No hay datos meteorológicos disponibles."}
                        </p>
                    )}
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
                    {data ? (
                        <Wind data={data} />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Cargando datos meteorológicos..."
                                : "No hay datos meteorológicos disponibles."}
                        </p>
                    )}
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Rainfall
                </summary>
                <div className="p-4 pt-0">
                    {data ? (
                        <Rainfall data={data} />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Cargando datos meteorológicos..."
                                : "No hay datos meteorológicos disponibles."}
                        </p>
                    )}
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Sun-Moon
                </summary>
                    <div className="p-4 pt-0">
                        {sunMoonLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Cargando datos del Sol y la Luna...
                            </p>
                        ) : sunMoonData ? (
                            <SunMoon data={sunMoonData} />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No hay datos del Sol y la Luna disponibles.
                            </p>
                        )}
                    </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Outdoor
                </summary>
                <div className="p-4 pt-0">
                    {data ? (
                        <Outdoor
                            data={{
                                outdoor: data.outdoor,
                                changes: {
                                    temperatureFromYesterday:
                                        yesterdayData?.temperatureFromYesterday ?? null,
                                },
                            }}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Cargando datos meteorológicos..."
                                : "No hay datos meteorológicos disponibles."}
                        </p>
                    )}
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Humidity
                </summary>
                <div className="p-4 pt-0">
                    {data ? (
                        <Humidity
                            data={{
                                humidity: data.humidity,
                                changes: {
                                    humidityFromYesterday:
                                        yesterdayData?.humidityFromYesterday ?? null,
                                },
                            }}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Cargando datos meteorológicos..."
                                : "No hay datos meteorológicos disponibles."}
                        </p>
                    )}
                </div>
            </details>

            <details className="rounded-xl border">
                <summary className="cursor-pointer p-4 font-semibold">
                    Pressure
                </summary>
                <div className="p-4 pt-0">
                    {data ? (
                        <Pressure
                            data={{
                                pressure: data.pressure,
                                changes: {
                                    pressureRate: pressureChangeData?.pressureRate ?? null,
                                },
                            }}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {loading
                                ? "Cargando datos meteorológicos..."
                                : "No hay datos meteorológicos disponibles."}
                        </p>
                    )}
                </div>
            </details>
        </main>
    );
}