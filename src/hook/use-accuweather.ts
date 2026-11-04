"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import {
    getAccuWeatherForecast,
    getAccuWeatherHourlyForecast,
} from "@/src/services/accuweather";

import type {
    AccuWeatherDailyForecast,
    AccuWeatherDailyResponse,
    AccuWeatherHourlyResponse,
} from "@/src/types/accuweather";

export function useAccuWeather() {
    const [data, setData] = useState<AccuWeatherDailyForecast | null>(null);
    const [dailyData, setDailyData] = useState<AccuWeatherDailyResponse | null>(null);
    const [hourlyData, setHourlyData] = useState<AccuWeatherHourlyResponse>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isRefreshing = useRef(false);

    const activeController = useRef<AbortController | null>(null);

    const refresh = useCallback(async (signal?: AbortSignal) => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;

        try {
            setError(null);

            const [dailyResult, hourlyResult] = await Promise.allSettled([
                getAccuWeatherForecast(signal),
                getAccuWeatherHourlyForecast(signal),
            ]);

            if (signal?.aborted) return;

            if (dailyResult.status === "fulfilled") {
                setDailyData(dailyResult.value);
                setData(dailyResult.value.DailyForecasts[0] ?? null);
            }

            if (hourlyResult.status === "fulfilled") {
                setHourlyData(hourlyResult.value);
            }

            const errors: string[] = [];

            if (dailyResult.status === "rejected") {
                errors.push("No se pudo actualizar el pronóstico diario.");
            }

            if (hourlyResult.status === "rejected") {
                errors.push("No se pudo actualizar el pronóstico por horas.");
            }

            if (errors.length > 0) {
                setError(errors.join(" "));
            }
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

        const interval = setInterval(executeRefresh, 15 * 60 * 1000);

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
        dailyData,
        hourlyData,
        loading,
        error,
        refresh,
    };
}