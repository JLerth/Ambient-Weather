
import type {
    AccuWeatherDailyResponse,
    AccuWeatherHourlyResponse,
} from "@/src/types/accuweather";

const API_KEY = process.env.NEXT_PUBLIC_ACCUWEATHER_API_KEY;
const LOCATION_KEY = process.env.NEXT_PUBLIC_ACCUWEATHER_LOCATION_KEY;

export async function getAccuWeatherForecast(): Promise<AccuWeatherDailyResponse> {
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

    const response = await fetch(url.toString(), {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `Error al consultar AccuWeather: ${response.status}`
        );
    }

    return response.json() as Promise<AccuWeatherDailyResponse>;
}

export async function getAccuWeatherHourlyForecast(): Promise<AccuWeatherHourlyResponse> {
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

    const response = await fetch(url.toString(), {
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `Error al consultar el pronóstico horario: ${response.status}`
        );
    }

    return response.json() as Promise<AccuWeatherHourlyResponse>;
}