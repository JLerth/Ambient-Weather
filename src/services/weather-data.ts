import {
    getCurrentWeather,
    getDeviceSummaries,
    getYesterdayData,
    getPressureLastHour,    
} from "@/src/services/ambient-weather";

import type {
    DeviceSummary,
    WeatherDashboardData,
    TemperatureRange,
    WeatherData,
} from "@/src/types/ambient-weather";

import {
    fahrenheitToCelsius,
    mphToKmh,
    inchesToMillimeters,
    inHgToHpa,
    roundValue,
} from "@/src/utils/unit-conversions";

const MAX_COMPARISON_MINUTES = 10;

/**
 * Convierte un resumen de temperatura a Celsius.
 */
function getTemperatureRange(
    summaries: DeviceSummary[]
): TemperatureRange {
    const highs = summaries
        .map((item) => item.tempf?.h)
        .filter((value): value is number => value !== undefined);

    const lows = summaries
        .map((item) => item.tempf?.l)
        .filter((value): value is number => value !== undefined);

    return {
        high: highs.length
            ? roundValue(fahrenheitToCelsius(Math.max(...highs)))
            : null,

        low: lows.length
            ? roundValue(fahrenheitToCelsius(Math.min(...lows)))
            : null,
    };
}

/*
 * Busca una medición de ayer cercana a la misma hora.
 * Solo acepta registros separados aproximadamente por 24 horas.
 */
function findYesterdayMeasurement(
    current: WeatherData,
    yesterdayData: WeatherData[],
): WeatherData | null {
    const targetTimestamp = current.dateutc - 24 * 60 * 60 * 1000;

    let closest: WeatherData | null = null;
    let smallestDifference = Infinity;

    for (const item of yesterdayData) {
        const difference = Math.abs(item.dateutc - targetTimestamp);

        if (difference < smallestDifference) {
            closest = item;
            smallestDifference = difference;
        }
    }

    if (
        !closest ||
        smallestDifference > MAX_COMPARISON_MINUTES * 60 * 1000
    ) {
        return null;
    }

    return closest;
}

/**
 * Calcula la variación de presión en hPa por hora.
 */
function calculatePressureRate(
    readings: WeatherData[],
): number | null {
    const validReadings = readings
        .filter(
            (item) =>
                typeof item.baromrelin === "number" &&
                Number.isFinite(item.baromrelin) &&
                Number.isFinite(item.dateutc),
        )
        .sort((a, b) => a.dateutc - b.dateutc);

    if (validReadings.length < 2) {
        return null;
    }

    const first = validReadings[0];
    const last = validReadings[validReadings.length - 1];

    const elapsedHours = (last.dateutc - first.dateutc) / 3_600_000;

    if (elapsedHours <= 0) {
        return null;
    }

    const differenceInHg = last.baromrelin! - first.baromrelin!;

    return roundValue(inHgToHpa(differenceInHg) / elapsedHours, 2);
}

/**
 * Obtiene los datos meteorológicos preparados para el dashboard.
 */
export async function getWeatherData(): Promise<WeatherDashboardData> {
    const [raw, summaries, yesterdayData, pressureReadings] = await Promise.all([
        getCurrentWeather(),
        getDeviceSummaries(),
        getYesterdayData(),
        getPressureLastHour(),
    ]);

    const today = summaries[0] ? [summaries[0]] : [];
    const yesterday = summaries[1] ? [summaries[1]] : [];
    const weekly = summaries.slice(0, 7);

    // La fecha del equipo debe interpretarse en la zona horaria de la estación.
    const stationDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "2-digit",
    }).format(new Date(raw.dateutc));

    const monthly = summaries.filter((item) => {
        const itemMonth = new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Guayaquil",
            year: "numeric",
            month: "2-digit",
        }).format(new Date(item.dateutc));

        return itemMonth === stationDate;
    });

    // No calculamos extremos anuales sin cobertura suficiente.
    const yearly: DeviceSummary[] = [];

    const previousMeasurement = findYesterdayMeasurement(raw, yesterdayData);

    const temperatureFromYesterday =
        previousMeasurement?.tempf !== undefined &&
        raw.tempf !== undefined
            ? roundValue(raw.tempf - previousMeasurement.tempf, 1)
            : null;

    const humidityFromYesterday =
        previousMeasurement?.humidity !== undefined &&
        raw.humidity !== undefined
            ? roundValue(raw.humidity - previousMeasurement.humidity, 1)
            : null;

    return {
        raw,

        outdoor: {
            temperature: raw.tempf !== undefined
                ? roundValue(fahrenheitToCelsius(raw.tempf))
                : null,

            feelsLike: raw.feelsLike !== undefined
                ? roundValue(fahrenheitToCelsius(raw.feelsLike))
                : null,

            dewPoint: null,
        },

        wind: {
            speed: raw.windspeedmph !== undefined
                ? roundValue(mphToKmh(raw.windspeedmph))
                : null,

            gust: raw.windgustmph !== undefined
                ? roundValue(mphToKmh(raw.windgustmph))
                : null,

            maxDailyGust: raw.maxdailygust !== undefined
                ? roundValue(mphToKmh(raw.maxdailygust))
                : null,

            direction: raw.winddir ?? null,
            averageDirection: raw.winddir_avg10m ?? null,
        },

        rainfall: {
            hourly: raw.hourlyrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.hourlyrainin))
                : null,

            event: raw.eventrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.eventrainin))
                : null,

            daily: raw.dailyrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.dailyrainin))
                : null,

            weekly: raw.weeklyrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.weeklyrainin))
                : null,

            monthly: raw.monthlyrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.monthlyrainin))
                : null,

            yearly: raw.yearlyrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.yearlyrainin))
                : null,

            total: raw.totalrainin !== undefined
                ? roundValue(inchesToMillimeters(raw.totalrainin))
                : null,
        },

        humidity: {
            current: raw.humidity ?? null,
        },

        pressure: {
            relative: raw.baromrelin !== undefined
                ? roundValue(inHgToHpa(raw.baromrelin), 1)
                : null,

            absolute: raw.baromabsin !== undefined
                ? roundValue(inHgToHpa(raw.baromabsin), 1)
                : null,
        },

        changes: {
            temperatureFromYesterday,
            humidityFromYesterday,
            pressureRate: calculatePressureRate(pressureReadings),
        },

        historical: {
            today: getTemperatureRange(today),
            yesterday: getTemperatureRange(yesterday),
            weekly: getTemperatureRange(weekly),
            monthly: getTemperatureRange(monthly),
            yearly: getTemperatureRange(yearly),
        },

        dateutc: raw.dateutc,
    };
}