"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
    getCurrentWeatherData,
    getHistoricalWeatherData,
    getYesterdayWeatherData,
    getPressureChangeData,
} from "@/src/services/weather-data";

import type { WeatherData } from "@/src/types/ambient-weather";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

type DataMap = {
    current: Awaited<ReturnType<typeof getCurrentWeatherData>>;
    historical: Awaited<ReturnType<typeof getHistoricalWeatherData>>;
    yesterday: Awaited<ReturnType<typeof getYesterdayWeatherData>>;
    pressure: Awaited<ReturnType<typeof getPressureChangeData>>;
};

type RequestKey = keyof DataMap;

interface Block<T> {
    data: T | null;
    error: string | null;
}

type State = { [K in RequestKey]: Block<DataMap[K]> };

type Action =
    | { [K in RequestKey]: { type: "success"; key: K; data: DataMap[K] } }[RequestKey]
    | { type: "error"; key: RequestKey; error: string };

interface Engine {
    retryFailed: () => Promise<void>;
}

interface UseWeatherDataReturn {
    currentData: DataMap["current"] | null;
    historicalData: DataMap["historical"] | null;
    yesterdayData: DataMap["yesterday"] | null;
    pressureChangeData: DataMap["pressure"] | null;

    currentError: string | null;
    historicalError: string | null;
    yesterdayError: string | null;
    pressureChangeError: string | null;

    loading: boolean;
    /** Reintenta únicamente los bloques que están en error. */
    retryFailed: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Constantes y helpers                                                       */
/* -------------------------------------------------------------------------- */

const REFRESH_INTERVAL = 5 * 60 * 1000;
const RETRY_BASE_DELAY = 30 * 1000;
const MAX_RETRY_DELAY = 5 * 60 * 1000;

const DEPENDENT_KEYS = ["historical", "yesterday"] as const;

const initialState: State = {
    current: { data: null, error: null },
    historical: { data: null, error: null },
    yesterday: { data: null, error: null },
    pressure: { data: null, error: null },
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "success":
            return { ...state, [action.key]: { data: action.data, error: null } };
        case "error":
            // Conserva los últimos datos buenos y solo actualiza el error.
            return {
                ...state,
                [action.key]: { ...state[action.key], error: action.error },
            };
    }
}

function getErrorMessage(err: unknown): string {
    return err instanceof Error
        ? err.message
        : "No se pudieron obtener los datos meteorológicos.";
}

function record<T>(value: T): Record<RequestKey, T> {
    return { current: value, historical: value, yesterday: value, pressure: value };
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useWeatherData(): UseWeatherDataReturn {
    const [state, dispatch] = useReducer(reducer, initialState);
    const [loading, setLoading] = useState(true);

    // Toda la lógica de carga vive dentro del efecto (cierres estables, sin
    // refs mutables asignados durante el render). Aquí solo se expone.
    const engineRef = useRef<Engine | null>(null);

    useEffect(() => {
        // Un único controller por montaje: cancela peticiones periódicas,
        // reintentos y recargas manuales al desmontar.
        const controller = new AbortController();
        const { signal } = controller;

        // Estado interno que no necesita provocar re-render.
        let raw: WeatherData | null = null;
        const inFlight = new Map<RequestKey, Promise<boolean>>();
        const timers = new Map<RequestKey, ReturnType<typeof setTimeout>>();
        const attempts = record(0);
        const hasData = record(false);
        const hasError = record(false);

        const fetchers: { [K in RequestKey]: () => Promise<DataMap[K]> } = {
            current: () => getCurrentWeatherData(signal),
            historical: () => getHistoricalWeatherData(raw as WeatherData, signal),
            yesterday: () => getYesterdayWeatherData(raw as WeatherData, signal),
            pressure: () => getPressureChangeData(signal),
        };

        const clearTimer = (key: RequestKey) => {
            const timer = timers.get(key);
            if (timer) {
                clearTimeout(timer);
                timers.delete(key);
            }
        };

        // Backoff exponencial: 30 s, 60 s, 120 s... hasta 5 min.
        const scheduleRetry = (key: RequestKey) => {
            clearTimer(key);

            const delay = Math.min(
                RETRY_BASE_DELAY * 2 ** attempts[key],
                MAX_RETRY_DELAY
            );
            attempts[key] += 1;

            timers.set(
                key,
                setTimeout(() => {
                    timers.delete(key);
                    void retry(key);
                }, delay)
            );
        };

        /**
         * Carga un bloque. Si ya hay una petición en curso para ese bloque,
         * devuelve la misma promesa (deduplicación + permite "esperar" a un
         * reintento en vuelo). Devuelve true si tuvo éxito.
         */
        const load = (key: RequestKey): Promise<boolean> => {
            if (signal.aborted) return Promise.resolve(false);

            const existing = inFlight.get(key);
            if (existing) return existing;

            // Los dependientes necesitan la lectura actual como entrada.
            if ((key === "historical" || key === "yesterday") && !raw) {
                return Promise.resolve(false);
            }

            const run = async (): Promise<boolean> => {
                try {
                    const data = await fetchers[key]();
                    if (signal.aborted) return false;

                    if (key === "current") {
                        raw = (data as DataMap["current"]).raw;
                    }

                    hasData[key] = true;
                    hasError[key] = false;
                    attempts[key] = 0;
                    clearTimer(key);

                    dispatch({ type: "success", key, data } as Action);
                    return true;
                } catch (err) {
                    if (!signal.aborted) {
                        hasError[key] = true;
                        dispatch({ type: "error", key, error: getErrorMessage(err) });
                        scheduleRetry(key);
                    }
                    return false;
                }
            };

            const promise = run().finally(() => inFlight.delete(key));
            inFlight.set(key, promise);
            return promise;
        };

        // Carga los dependientes que aún no tienen datos o están en error.
        const loadMissingDependents = () =>
            Promise.all(
                DEPENDENT_KEYS.filter((k) => !hasData[k] || hasError[k]).map(load)
            );

        // Reintento de un bloque; si es `current` y se recupera, también
        // recupera los dependientes que quedaron pendientes.
        const retry = async (key: RequestKey) => {
            if (signal.aborted) return;

            const ok = await load(key);

            if (ok && key === "current" && !signal.aborted) {
                await loadMissingDependents();
            }
        };

        // Ciclo completo: current primero, luego el resto en paralelo.
        const refreshAll = async () => {
            if (signal.aborted) return;

            await load("current");

            if (signal.aborted) return;

            await Promise.all([
                load("historical"),
                load("yesterday"),
                load("pressure"),
            ]);
        };

        const retryFailed = async () => {
            if (signal.aborted) return;

            const failedKeys = (Object.keys(hasError) as RequestKey[]).filter(
                (k) => hasError[k]
            );

            await Promise.all(failedKeys.map(retry));
        };

        engineRef.current = { retryFailed };

        // Carga inicial
        void refreshAll().finally(() => {
            if (!signal.aborted) setLoading(false);
        });

        // Actualización periódica y al recuperar conexión
        const interval = setInterval(() => void refreshAll(), REFRESH_INTERVAL);
        const handleOnline = () => void refreshAll();
        window.addEventListener("online", handleOnline);

        return () => {
            controller.abort();
            clearInterval(interval);
            window.removeEventListener("online", handleOnline);
            timers.forEach((timer) => clearTimeout(timer));
            timers.clear();
            engineRef.current = null;
        };
    }, []);

    const retryFailed = useCallback(async () => {
        await engineRef.current?.retryFailed();
    }, []);

    return {
        currentData: state.current.data,
        historicalData: state.historical.data,
        yesterdayData: state.yesterday.data,
        pressureChangeData: state.pressure.data,

        currentError: state.current.error,
        historicalError: state.historical.error,
        yesterdayError: state.yesterday.error,
        pressureChangeError: state.pressure.error,

        loading,
        retryFailed,
    };
}