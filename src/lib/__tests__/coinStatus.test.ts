import { describe, it, expect } from "vitest";
import {
  coinIsUnavailable,
  deriveCoinStatus,
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

  // Zero coins are in this state in the shipped data, so the unit test is the
  // only place the rule is exercised.
  it("keeps a collected coin collected once it stops being offered", () => {
    expect(deriveCoinStatus(state(true, false))).toBe("collected");
  });

  it("covers every coin state", () => {
    expect(expected).toHaveLength(ALL_STATES.length);
  });
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
