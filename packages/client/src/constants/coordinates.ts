/**
 * Limits and resolution of coordinates.
 * Implements FR5, FR6, FR7 of add-city-coordinates-to-locations (D1).
 * This file imports nothing: the Node scripts import it by relative path.
 */
export const MAX_LATITUDE_DEGREES = 90;
export const MAX_LONGITUDE_DEGREES = 180;
/** The committed and served files store degrees as integer tenths (D2). */
export const COORDINATE_TENTHS_PER_DEGREE = 10;
