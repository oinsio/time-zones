import type { ZoneCityData } from "./citySource";
import { createCompositeCitySearch } from "./createCompositeCitySearch";

export const city = (
  timeZoneId: string,
  en: string,
  ru: string,
  countryCode = "",
): ZoneCityData => ({ timeZoneId, names: { en, ru }, countryCode });

export const zoneCities: ZoneCityData[] = [
  city("Asia/Kolkata", "Kolkata", "Калькутта", "IN"),
  city("Asia/Jerusalem", "Jerusalem", "Иерусалим", "IL"),
  city("Europe/Dublin", "Dublin", "Дублин", "IE"),
  city("Europe/Istanbul", "Istanbul", "Стамбул", "TR"),
  city("Europe/Moscow", "Moscow", "Москва", "RU"),
  city("Europe/Tallinn", "Tallinn", "Таллин", "EE"),
  city("America/New_York", "New York", "Нью-Йорк", "US"),
  city("America/Sao_Paulo", "São Paulo", "Сан-Паулу", "BR"),
  city("Asia/Almaty", "Almaty", "Алматы", "KZ"),
  city("Asia/Qostanay", "Kostanay", "Костанай", "KZ"),
  city("Asia/Aqtobe", "Aqtobe", "Актобе", "KZ"),
  city("UTC", "UTC", "UTC"),
];
export const search = createCompositeCitySearch(zoneCities);
export const idsOf = (query: string, language: "en" | "ru" = "en") =>
  search.search(query, language).map((result) => result.record.timeZoneId);
