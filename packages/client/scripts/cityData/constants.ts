/**
 * Constants of the city data compiler and its check.
 * Implements FR1, FR2, FR11, FR12 of add-geonames-city-source (D5, D8).
 */

export const MIN_POPULATION = 100_000;
export const CAPITAL_FEATURE_CODE = "PPLC";
export const MIN_CITY_COUNT = 6000;
export const MIN_CYRILLIC_SHARE = 0.95;
export const DATASET_FORMAT_VERSION = 1;
export const DATASET_PATH = "city-data/geonames-cities.json";
export const README_PATH = "city-data/README.md";
export const GEONAMES_LICENCE = "CC BY 4.0";
export const GEONAMES_SOURCE_NAME = "GeoNames";

export const NAME_LANGUAGE_ENGLISH = "en";
export const NAME_LANGUAGE_RUSSIAN = "ru";
export const NAME_LANGUAGES: readonly string[] = [
  NAME_LANGUAGE_ENGLISH,
  NAME_LANGUAGE_RUSSIAN,
];

export const GEONAMES_DUMP_BASE_URL =
  "https://download.geonames.org/export/dump/";
export const CITIES_ARCHIVE_NAME = "cities15000.zip";
export const CITIES_FILE_NAME = "cities15000.txt";
export const ALTERNATE_NAMES_ARCHIVE_NAME = "alternateNamesV2.zip";
export const ALTERNATE_NAMES_FILE_NAME = "alternateNamesV2.txt";
export const ADMIN1_FILE_NAME = "admin1CodesASCII.txt";
export const UNZIP_COMMAND = "unzip";
/** Info-ZIP zipinfo mode with entry times as `yyyymmdd.hhmmss`: names the day GeoNames built the dump. */
export const UNZIP_LIST_FLAGS: readonly string[] = ["-Z", "-T"];
export const DUMP_ENTRY_TIME_PATTERN = /(\d{4})(\d{2})(\d{2})\.\d{6}/;
export const WORK_DIRECTORY_PREFIX = "city-data-compile-";

export const COLUMN_SEPARATOR = "\t";
export const ADMIN1_KEY_SEPARATOR = ".";
export const ADMIN1_FEATURE_PREFIX = "ADM1";
export const FLAG_TRUE = "1";
export const NO_RUSSIAN_NAME_MARKER = 0;

export const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;
export const CYRILLIC_PATTERN = /[Ѐ-ӿ]/;
export const PERCENT_FACTOR = 100;
