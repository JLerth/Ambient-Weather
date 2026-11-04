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
    const activeController = useRef<AbortController | null>(null);

    const refresh = useCallback(async (signal?: AbortSignal) => {
        if (isRefreshing.current) return;

        isRefreshing.current = true;

        try {
            setError(null);

            const weatherData = await getWeatherData(signal);

            if (!signal?.aborted) {
                setData(weatherData);
            }
        } catch (err) {
            if (signal?.aborted) return;

            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudieron obtener los datos meteorológicos."
            );
        } finally {
            isRefreshing.current = false;

            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const executeRefresh = () => {
            if (activeController.current) return;

            const controller = new AbortController();
            activeController.current = controller;

            refresh(controller.signal).finally(() => {
                if (activeController.current === controller) {
                    activeController.current = null;
                }
            });
        };

        executeRefresh();

        const interval = setInterval(executeRefresh, 5 * 60 * 1000);

        const handleOnline = () => {
            executeRefresh();
        };

        window.addEventListener("online", handleOnline);

        return () => {
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);

            activeController.current?.abort();
            activeController.current = null;
            isRefreshing.current = false;
        };
    }, [refresh]);

    return {
        data,
        loading,
        error,
        refresh,
    };
}