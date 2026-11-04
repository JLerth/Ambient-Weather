"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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
    const isRefreshing = useRef(false);

    const refresh = useCallback(async () => {
        if (isRefreshing.current) return;

        isRefreshing.current = true;

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
            isRefreshing.current = false;
        }
    }, []);

    useEffect(() => {
        refresh();

        const interval = setInterval(refresh, 5 * 60 * 1000);

        const handleOnline = () => {
            refresh();
        };

        window.addEventListener("online", handleOnline);

        return () => {
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);
        };
    }, [refresh]);

    return {
        data,
        loading,
        error,
        refresh,
    };
}