/**
 * Datos meteorológicos actuales de la estación.
 * Las unidades originales de la API son imperiales.
 */
export interface WeatherData {
    dateutc: number;
    dateutc5?: string;
    stationtype?: string;

    // Temperatura
    tempf?: number;
    feelsLike?: number;

    // Humedad
    humidity?: number;

    // Viento
    windspeedmph?: number;
    windgustmph?: number;
    maxdailygust?: number;
    winddir?: number;
    winddir_avg10m?: number;

    // Precipitación
    hourlyrainin?: number;
    eventrainin?: number;
    dailyrainin?: number;
    weeklyrainin?: number;
    monthlyrainin?: number;
    yearlyrainin?: number;
    totalrainin?: number;

    // Presión atmosférica
    baromrelin?: number;
    baromabsin?: number;

    // Información adicional
    lastRain?: string;
    tz?: string;

    // Resumen de estadísticas
    hl?: WeatherHistoricalData;
}

/**
 * Estadísticas históricas proporcionadas por Ambient Weather.
 */
export interface HistoricalValue {
    h?: number;
    l?: number;
    c?: number;
    s?: number;
    ht?: number;
    lt?: number;
}

/**
 * Estadísticas de una variable meteorológica.
 */
export interface SummaryValue {
    h?: number;
    l?: number;
    c?: number;
    s?: number;
    ht?: number;
    lt?: number;
}

/**
 * Estadísticas de dirección del viento.
 */
export interface WindDirectionSummary {
    [direction: string]: number;
}

/**
 * Resumen meteorológico de un periodo.
 */
export interface DeviceSummary {
    dateutc: number;
    tempf?: SummaryValue;
    feelsLike?: SummaryValue;
    dewPoint?: SummaryValue;
    windspeedmph?: SummaryValue;
    windgustmph?: SummaryValue;
    maxdailygust?: SummaryValue;
    humidity?: SummaryValue;
    hourlyrainin?: SummaryValue;
    eventrainin?: SummaryValue;
    dailyrainin?: SummaryValue;
    weeklyrainin?: SummaryValue;
    monthlyrainin?: SummaryValue;
    yearlyrainin?: SummaryValue;
    totalrainin?: SummaryValue;
    baromrelin?: SummaryValue;
    baromabsin?: SummaryValue;
    winddir?: string | WindDirectionSummary;
    winddir_avg10m?: string | WindDirectionSummary;
    type?: string;
}

export interface WeatherHistoricalData {
    tempf?: HistoricalValue;
    feelsLike?: HistoricalValue;
    dewPoint?: HistoricalValue;
    windspeedmph?: HistoricalValue;
    windgustmph?: HistoricalValue;
    humidity?: HistoricalValue;
    hourlyrainin?: HistoricalValue;
    baromrelin?: HistoricalValue;
    baromabsin?: HistoricalValue;

    [key: string]: HistoricalValue | undefined;
}

export interface TemperatureRange {
    high: number | null;
    low: number | null;
}

export interface HistoricalWeatherData {
    today: TemperatureRange;
    yesterday: TemperatureRange;
    weekly: TemperatureRange;
    monthly: TemperatureRange;
    yearly: TemperatureRange;
}

/**
 * Información general de la estación.
 */
export interface StationInfo {
    name?: string;
    slug?: string;
    indoor?: boolean;
    coords?: {
        latitude?: number;
        longitude?: number;
    };
}

/**
 * Configuración de unidades de Ambient Weather.
 */
export interface StationUnitSettings {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Elemento individual devuelto por el endpoint devices.
 */
export interface StationDevice {
    macAddress: string;
    lastData: WeatherData;
    info?: StationInfo;
    settings?: {
        widgetOrder?: string[];
        [key: string]: unknown;
    };
    unitSettings?: StationUnitSettings;
}


/**
 * Datos meteorológicos preparados para utilizar
 * en los widgets del dashboard.
 */
export interface WeatherDashboardData {
    raw: WeatherData;

    outdoor: {
        temperature: number | null;
        feelsLike: number | null;
        dewPoint: number | null;
    };

    wind: {
        speed: number | null;
        gust: number | null;
        maxDailyGust: number | null;
        direction: number | null;
        averageDirection: number | null;
    };

    rainfall: {
        hourly: number | null;
        event: number | null;
        daily: number | null;
        weekly: number | null;
        monthly: number | null;
        yearly: number | null;
        total: number | null;
    };

    humidity: {
        current: number | null;
    };

    pressure: {
        relative: number | null;
        absolute: number | null;
    };

    changes: {
        temperatureFromYesterday: number | null;
        humidityFromYesterday: number | null;
        pressureRate: number | null;
    };

    dateutc: number;

    historical: HistoricalWeatherData;
}

/**
 * Respuesta general del endpoint público devices.
 */
export interface StationResponse {
    data: StationDevice[];
}