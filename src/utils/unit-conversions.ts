/**
 * Conversiones de unidades meteorológicas.
 */

// Temperatura: Fahrenheit a Celsius
export function fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
}

// Velocidad: millas por hora a kilómetros por hora
export function mphToKmh(mph: number): number {
    return mph * 1.609344;
}

// Precipitación: pulgadas a milímetros
export function inchesToMillimeters(inches: number): number {
    return inches * 25.4;
}

// Presión: pulgadas de mercurio a hectopascales
export function inHgToHpa(inHg: number): number {
    return inHg * 33.8638866667;
}

/**
 * Redondea un valor al número de decimales indicado.
 */
export function roundValue(value: number, decimals = 1): number {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
}