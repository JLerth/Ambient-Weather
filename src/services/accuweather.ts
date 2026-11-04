import type {
    AccuWeatherDailyResponse,
    AccuWeatherHourlyResponse,
} from "@/src/types/accuweather";

const API_KEY = process.env.NEXT_PUBLIC_ACCUWEATHER_API_KEY;
const LOCATION_KEY = process.env.NEXT_PUBLIC_ACCUWEATHER_LOCATION_KEY;

const REQUEST_TIMEOUT = 15 * 1000;

// Combina el signal del hook con un timeout, para que una petición colgada
// no bloquee para siempre la deduplicación del hook.
function withTimeout(signal?: AbortSignal) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const onAbort = () => controller.abort();

    if (signal?.aborted) controller.abort();
    signal?.addEventListener("abort", onAbort, { once: true });

    return {
        signal: controller.signal,
        clear: () => {
            clearTimeout(timer);
            signal?.removeEventListener("abort", onAbort);
        },
    };
}

export async function getAccuWeatherForecast(signal?: AbortSignal): Promise<AccuWeatherDailyResponse> {
    if (!API_KEY || !LOCATION_KEY) {
        throw new Error(
            "Falta configurar las credenciales de AccuWeather."
        );
    }

    const url = new URL(
        `https://dataservice.accuweather.com/forecasts/v1/daily/7day/${LOCATION_KEY}`
    );

    url.searchParams.set("apikey", API_KEY);
    url.searchParams.set("details", "true");
    url.searchParams.set("metric", "true");
    url.searchParams.set("language", "es-ec");

    const request = withTimeout(signal);

    try {
        const response = await fetch(url.toString(), {
            cache: "no-store",
            signal: request.signal,
        });

        if (!response.ok) {
            throw new Error(
                `Error al consultar AccuWeather: ${response.status}`
            );
        }

        return (await response.json()) as AccuWeatherDailyResponse;
    } finally {
        request.clear();
    }
}

export async function getAccuWeatherHourlyForecast(signal?: AbortSignal): Promise<AccuWeatherHourlyResponse> {
    if (!API_KEY || !LOCATION_KEY) {
        throw new Error(
            "Falta configurar las credenciales de AccuWeather."
        );
    }

    const url = new URL(
        `https://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${LOCATION_KEY}`
    );

    url.searchParams.set("apikey", API_KEY);
    url.searchParams.set("details", "true");
    url.searchParams.set("metric", "true");
    url.searchParams.set("language", "es-ec");

    const request = withTimeout(signal);

    try {
        const response = await fetch(url.toString(), {
            cache: "no-store",
            signal: request.signal,
        });

        if (!response.ok) {
            throw new Error(
                `Error al consultar el pronóstico horario: ${response.status}`
            );
        }

        return (await response.json()) as AccuWeatherHourlyResponse;
    } finally {
        request.clear();
    }
}