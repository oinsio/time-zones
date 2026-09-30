// FR1 of add-locations-via-search: query normalization (D7).
import { describe, expect, it } from "vitest";
import { normalizeSearchText, splitIntoWords } from "./normalizeSearchText";

describe("normalizeSearchText", () => {
  it.each([
    ["MOSCOW", "moscow"],
    ["  Moscow ", "moscow"],
    ["São Paulo", "sao paulo"],
    ["Ёлка", "елка"],
    ["Москва", "москва"],
    ["Zürich", "zurich"],
    ["", ""],
    ["   ", ""],
    ["New York", "new york"],
  ])("should normalize %j to %j", (input, expected) => {
    expect(normalizeSearchText(input)).toBe(expected);
  });
});

describe("splitIntoWords", () => {
  it.each([
    ["new york", ["new", "york"]],
    ["port-au-prince", ["port", "au", "prince"]],
    ["l'aquila", ["l", "aquila"]],
    ["l’aquila", ["l", "aquila"]],
    ["st. john's", ["st", "john", "s"]],
    ["america/new_york", ["america", "new_york"]],
    ["ho (chi)", ["ho", "chi"]],
    ["  lone ", ["lone"]],
    ["", []],
  ])("should split %j into %j", (input, expected) => {
    expect(splitIntoWords(input)).toEqual(expected);
  });
});
