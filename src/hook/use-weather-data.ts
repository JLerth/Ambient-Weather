"use client";

import { useCallback, useEffect, useState } from "react";
import { getWeatherData } from "@/src/services/weather-data";
import type { WeatherDashboardData } from "@/src/types/ambient-weather";

interface UseWeatherDataReturn {
    data: WeatherDashboardData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useWeatherData(): UseWeatherDataReturn {
    const [data, setData] = useState<WeatherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        try {
            setError(null);

            const weatherData = await getWeatherData();

            setData(weatherData);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron obtener los datos meteorológicos."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();

        const interval = setInterval(() => {
            refresh();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [refresh]);

    return {
        data,
        loading,
        error,
        refresh,
    };
}