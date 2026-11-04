"use client";

import { useCallback, useEffect, useState } from "react";

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

    const refresh = useCallback(async () => {
        try {
            setError(null);

            const [dailyResult, hourlyResult] = await Promise.all([
                getAccuWeatherForecast(),
                getAccuWeatherHourlyForecast(),
            ]);

            setDailyData(dailyResult);
            setData(dailyResult.DailyForecasts[0] ?? null);
            setHourlyData(hourlyResult);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo obtener el pronóstico de AccuWeather."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();

        const interval = setInterval(refresh, 30 * 60 * 1000);

        return () => clearInterval(interval);
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