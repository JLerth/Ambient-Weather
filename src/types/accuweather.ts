export interface AccuWeatherTemperature {
    Value: number;
    Unit: string;
    UnitType: number;
    Phrase?: string;
}

export interface AccuWeatherDirection {
    Degrees: number;
    Localized: string;
    English: string;
}

export interface AccuWeatherWind {
    Speed: AccuWeatherTemperature;
    Direction: AccuWeatherDirection;
}

export interface AccuWeatherDayNight {
    Icon: number;
    IconPhrase: string;
    HasPrecipitation: boolean;
    ShortPhrase?: string;
    LongPhrase?: string;
    PrecipitationProbability?: number;
    RainProbability?: number;
    ThunderstormProbability?: number;
    Wind?: AccuWeatherWind;
    WindGust?: AccuWeatherWind;
    TotalLiquid?: AccuWeatherTemperature;
    Rain?: AccuWeatherTemperature;
    CloudCover?: number;
    RelativeHumidity?: {
        Minimum: number;
        Maximum: number;
        Average: number;
    };
}

export interface AccuWeatherSun {
    Rise: string;
    Set: string;
    EpochRise?: number;
    EpochSet?: number;
}

export interface AccuWeatherMoon {
    Rise: string | null;
    Set: string | null;
    Phase: string;
    Age?: number;
    EpochRise?: number;
    EpochSet?: number;
}

export interface AccuWeatherDailyForecast {
    Date: string;
    EpochDate: number;
    Sun: AccuWeatherSun;
    Moon: AccuWeatherMoon;
    HoursOfSun: number;
    Temperature: {
        Minimum: AccuWeatherTemperature;
        Maximum: AccuWeatherTemperature;
    };
    RealFeelTemperature?: {
        Minimum: AccuWeatherTemperature;
        Maximum: AccuWeatherTemperature;
    };
    Day: AccuWeatherDayNight;
    Night: AccuWeatherDayNight;
}

export interface AccuWeatherDailyResponse {
    DailyForecasts: AccuWeatherDailyForecast[];
    Headline?: {
        Text?: string;
        Category?: string;
        EffectiveDate?: string;
        EndDate?: string;
    };
}

export interface AccuWeatherHourlyForecast {
    DateTime: string;
    WeatherIcon: number;
    IconPhrase: string;
    IsDaylight: boolean;
    Temperature: AccuWeatherTemperature;
    PrecipitationProbability: number;
}

export type AccuWeatherHourlyResponse = AccuWeatherHourlyForecast[];