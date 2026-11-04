import { STATION_CONFIG } from "@/src/config/station";
import type {
    StationDevice,
    StationResponse,
    WeatherData,
    DeviceSummary,
} from "@/src/types/ambient-weather";

const API_URL = `${STATION_CONFIG.apiBaseUrl}/devices?public.slug=${STATION_CONFIG.publicSlug}`;

/**
 * Construye la URL para consultar los datos históricos de Ambient Weather.
 */
function buildDeviceDataUrl(
    dataKey: string,
    start: number,
    options?: {
        stats?: string;
        asc?: boolean;
        limit?: number;
    }
) {
    const params = new URLSearchParams({
        macAddress: STATION_CONFIG.macAddress,
        dataKey,
        start: String(start),
    });

    if (options?.stats) {
        params.set("stats", options.stats);
    }

    if (options?.asc !== undefined) {
        params.set("asc", String(options.asc));
    }

    if (options?.limit !== undefined) {
        params.set("limit", String(options.limit));
    }

    return `${STATION_CONFIG.apiBaseUrl}/device-data?${params.toString()}`;
}

/**
 * Ejecuta una consulta al endpoint device-data.
 */
async function fetchDeviceData<T>(
    dataKey: string,
    start: number,
    options?: {
        stats?: string;
        asc?: boolean;
        limit?: number;
        signal?: AbortSignal;
    }
): Promise<T[]> {
    const url = buildDeviceDataUrl(dataKey, start, options);

    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: options?.signal,
    });

    if (!response.ok) {
        throw new Error(
            `Error al consultar ${dataKey}: ${response.status}`
        );
    }

    const result: { data?: T[] } = await response.json();

    if (!result.data || result.data.length === 0) {
        throw new Error(`La consulta ${dataKey} no devolvió datos.`);
    }

    return result.data;
}


/**
 * Obtiene la información meteorológica de la estación.
 */
export async function getStation(signal?: AbortSignal): Promise<StationDevice> {
    const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
        signal,
    });

    if (!response.ok) {
        throw new Error(
        `Error al consultar Ambient Weather: ${response.status}`
        );
    }

    const result: StationResponse = await response.json();

    if (!result.data || result.data.length === 0) {
        throw new Error("No se encontraron datos de la estación.");
    }

    const station = result.data.find(
        (device) => device.macAddress === STATION_CONFIG.macAddress
    );

    if (!station) {
        throw new Error("No se encontró la estación configurada.");
    }

    if (
        !station.lastData ||
        !Object.values(station.lastData).some(
            (value) => typeof value === "number" && Number.isFinite(value)
        )
    ) {
        throw new Error("La estación no contiene mediciones actuales.");
    }

    return station;
}

/**
 * Obtiene únicamente las mediciones meteorológicas actuales.
 */
export async function getCurrentWeather(signal?: AbortSignal) {
    const station = await getStation(signal);

    return station.lastData;
}

/**
 * Obtiene los resúmenes históricos de la estación.
 * Solicita un año de historial.
 */
export async function getDeviceSummaries(signal?: AbortSignal): Promise<DeviceSummary[]> {
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

    return fetchDeviceData<DeviceSummary>(
        "deviceSummaries",
        oneYearAgo,
        {
            stats: "summary",
            signal,
        }
    );
}

/**
 * Obtiene la medición correspondiente al periodo de ayer.
 */
export async function getYesterdayData(signal?: AbortSignal): Promise<WeatherData[]> {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000;

    return fetchDeviceData<WeatherData>(
        "yesterdayData",
        yesterday,
        {signal}
    );
}

/**
 * Obtiene la medición del periodo de presión de la última hora.
 */
export async function getPressureLastHour(signal?: AbortSignal): Promise<WeatherData[]> {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    return fetchDeviceData<WeatherData>(
        "pressureWidgetLastHour",
        oneHourAgo,
        {
            asc: true,
            limit: 20,
            signal,
        }
    );
}