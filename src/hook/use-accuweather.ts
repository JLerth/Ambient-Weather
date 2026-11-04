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

    const refresh = useCallback(async () => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;
        
        try {
            setError(null);

            const [dailyResult, hourlyResult] = await Promise.allSettled([
                getAccuWeatherForecast(),
                getAccuWeatherHourlyForecast(),
            ]);

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
            setLoading(false);
            isRefreshing.current = false;
        }
    }, []);

    useEffect(() => {
        refresh();

        const interval = setInterval(refresh, 15 * 60 * 1000);

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
        dailyData,
        hourlyData,
        loading,
        error,
        refresh,
    };
}