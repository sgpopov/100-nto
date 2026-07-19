import { describe, it, expect } from "vitest";
import {
  coinIsUnavailable,
  deriveCoinStatus,
  matchesCoinFilter,
  toCoinFilterValue,
  COIN_FILTER_VALUES,
  type CoinFilterValue,
  type CoinState,
  type CoinStatus,
} from "@/lib/coinStatus";

const state = (collected: boolean, available: boolean): CoinState => ({
  collected,
  available,
});

/** Every legal coin state: collected (2) x available (2). */
const ALL_STATES: { label: string; state: CoinState }[] = [
  { label: "not collected, available", state: state(false, true) },
  { label: "not collected, unavailable", state: state(false, false) },
  { label: "collected, available", state: state(true, true) },
  { label: "collected, unavailable", state: state(true, false) },
];

describe("deriveCoinStatus", () => {
  const expected: [CoinState, CoinStatus][] = [
    [state(false, true), "not-collected"],
    [state(false, false), "unavailable"],
    [state(true, true), "collected"],
    [state(true, false), "collected"],
  ];

  it.each(expected)("derives %o as %s", (input, status) => {
    expect(deriveCoinStatus(input)).toBe(status);
  });

  it("covers every coin state", () => {
    expect(expected).toHaveLength(ALL_STATES.length);
  });
});

describe("matchesCoinFilter", () => {
  const matrix: [CoinFilterValue, boolean[]][] = [
    // order follows ALL_STATES
    ["all", [true, true, true, true]],
    ["collected", [false, false, true, true]],
    ["not-collected", [true, false, false, false]],
    ["not-available", [false, true, false, true]],
  ];

  it.each(matrix)(
    "filter %s matches the expected states",
    (filter, expected) => {
      const actual = ALL_STATES.map((s) => matchesCoinFilter(s.state, filter));
      expect(actual).toEqual(expected);
    },
  );

  it("keeps the trip-planning list to coins that can actually be collected", () => {
    expect(matchesCoinFilter(state(false, false), "not-collected")).toBe(false);
    expect(matchesCoinFilter(state(false, true), "not-collected")).toBe(true);
  });

  it("answers on availability regardless of collection", () => {
    expect(matchesCoinFilter(state(true, false), "not-available")).toBe(true);
    expect(matchesCoinFilter(state(false, false), "not-available")).toBe(true);
  });

  it("keeps an owned coin collected once it stops being offered", () => {
    expect(matchesCoinFilter(state(true, false), "collected")).toBe(true);
  });

  it("covers every filter value", () => {
    expect(matrix.map(([filter]) => filter)).toEqual([...COIN_FILTER_VALUES]);
  });
});

describe("toCoinFilterValue", () => {
  it.each([...COIN_FILTER_VALUES])("accepts %s unchanged", (value) => {
    expect(toCoinFilterValue(value)).toBe(value);
  });

  // The values were renamed from yes/no when not-available joined the set, so
  // links bookmarked before that fall back rather than resolving wrongly.
  it.each(["yes", "no", "", "nonsense", null])(
    "falls back to all for %s",
    (value) => {
      expect(toCoinFilterValue(value)).toBe("all");
    },
  );
});

describe("coinIsUnavailable", () => {
  const expected: [CoinState, boolean][] = [
    [state(false, true), false],
    [state(false, false), true],
    [state(true, true), false],
    [state(true, false), true],
  ];

  it.each(expected)("reads %o as %s", (input, unavailable) => {
    expect(coinIsUnavailable(input)).toBe(unavailable);
  });

  it("is independent of collection, so a collected coin can still be unavailable", () => {
    expect(coinIsUnavailable(state(true, false))).toBe(true);
    expect(deriveCoinStatus(state(true, false))).toBe("collected");
  });

  it("covers every coin state", () => {
    expect(expected).toHaveLength(ALL_STATES.length);
  });
});
