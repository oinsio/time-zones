// @add-zone-rules-from-iana @FR2: shared setup of the cutoff truncation tests
export const CUTOFF = 946684800;

export const type = (
  utcOffsetSeconds: number,
  designation: string,
  isDaylightSavingTime = false,
) => ({
  utcOffsetSeconds,
  designation,
  isDaylightSavingTime,
});
