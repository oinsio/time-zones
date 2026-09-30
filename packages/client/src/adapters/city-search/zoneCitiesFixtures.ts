import type { ZoneCityData } from "./citySource";
import type { createZoneCitiesSource } from "./zoneCitiesSource";

export const moscow: ZoneCityData = {
  timeZoneId: "Europe/Moscow",
  names: { en: "Moscow", ru: "Москва" },
  countryCode: "RU",
};
export const newYork: ZoneCityData = {
  timeZoneId: "America/New_York",
  names: { en: "New York", ru: "Нью-Йорк" },
  countryCode: "US",
};
export const almaty: ZoneCityData = {
  timeZoneId: "Asia/Almaty",
  names: { en: "Almaty", ru: "Алматы" },
  countryCode: "KZ",
};
export const utc: ZoneCityData = {
  timeZoneId: "UTC",
  names: { en: "UTC", ru: "UTC" },
  countryCode: "",
};

export const idsOf = (source: ReturnType<typeof createZoneCitiesSource>) =>
  source.records.map((record) => record.timeZoneId);
