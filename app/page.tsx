"use client";

import { useWeatherData } from "@/src/hook/use-weather-data";

import { QuickView } from "@/src/components/weather/quick-view";
import { Outdoor } from "@/src/components/weather/outdoor";
import { Wind } from "@/src/components/weather/wind";
import { Rainfall } from "@/src/components/weather/rainfall";
import { Humidity } from "@/src/components/weather/humidity";
import { Pressure } from "@/src/components/weather/pressure";

export default function Home() {
    const { data, loading, error, refresh } = useWeatherData();

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