import { describe, it, expect } from "vitest";

import coins from "@/data/coins.json";
import places from "@/data/places.json";

/**
 * Both location filters match a selected value against the province and the
 * city field at once (`province === value || location === value`). A name used
 * for both a province and a city is therefore only safe when the two select the
 * same rows — otherwise one dropdown option silently returns the other's.
 *
 * `Други` is the deliberate exception that still passes: every coin in the
 * `Други` province also has `Други` as its location, so both sets are equal.
 */
function collisionsBetween(
  rows: { province: string; location: string }[],
): string[] {
  const provinces = new Set(rows.map((row) => row.province));

  return [...new Set(rows.map((row) => row.location))]
    .filter((location) => provinces.has(location))
    .filter((name) => {
      const byProvince = rows.filter((row) => row.province === name);
      const byLocation = rows.filter((row) => row.location === name);

      return (
        byProvince.length !== byLocation.length ||
        byProvince.some((row) => row.location !== name)
      );
    });
}

describe("location names", () => {
  it("keeps coin province and city names unambiguous", () => {
    expect(collisionsBetween(coins)).toEqual([]);
  });

  it("keeps site region and city names unambiguous", () => {
    const rows = places.map((city) => ({
      province: city.region,
      location: city.city,
    }));

    expect(collisionsBetween(rows)).toEqual([]);
  });

  it("names coin provinces the same way the sites data does", () => {
    const regions = new Set(places.map((city) => city.region));
    const unknown = [...new Set(coins.map((coin) => coin.province))]
      .filter((province) => province !== "Други")
      .filter((province) => !regions.has(province));

    expect(unknown).toEqual([]);
  });
});
