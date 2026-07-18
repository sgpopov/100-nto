import { describe, it, expect } from "vitest";
import {
  aggregateProgress,
  deriveStatus,
  matchesStampFilter,
  matchesStickerFilter,
  stickerIsUnavailable,
  toStampFilterValue,
  toStickerFilterValue,
  STAMP_FILTER_VALUES,
  STICKER_FILTER_VALUES,
  type CollectionState,
  type CollectionStatus,
  type StampFilterValue,
  type StickerFilterValue,
} from "@/lib/collectionStatus";

const state = (stamp: boolean, sticker: boolean | null): CollectionState => ({
  stamp,
  sticker,
});

/** Every legal site state: stamp (2) x sticker (3). */
const ALL_STATES: { label: string; state: CollectionState }[] = [
  { label: "no stamp, no sticker", state: state(false, false) },
  { label: "no stamp, sticker collected", state: state(false, true) },
  { label: "no stamp, sticker unavailable", state: state(false, null) },
  { label: "stamped, no sticker", state: state(true, false) },
  { label: "stamped, sticker collected", state: state(true, true) },
  { label: "stamped, sticker unavailable", state: state(true, null) },
];

describe("deriveStatus", () => {
  const expected: [CollectionState, CollectionStatus][] = [
    [state(false, false), "none"],
    [state(false, null), "none"],
    [state(false, true), "partial"],
    [state(true, false), "partial"],
    [state(true, true), "complete"],
    [state(true, null), "complete"],
  ];

  it.each(expected)("derives %o as %s", (input, status) => {
    expect(deriveStatus(input)).toBe(status);
  });

  it("treats a site offering no марка as complete once stamped", () => {
    expect(deriveStatus(state(true, null))).toBe("complete");
  });

  it("does not treat a site offering no марка as complete while unstamped", () => {
    expect(deriveStatus(state(false, null))).toBe("none");
  });

  it("covers every site state", () => {
    expect(expected).toHaveLength(ALL_STATES.length);
  });
});

describe("stickerIsUnavailable", () => {
  it("is true only for the null sticker", () => {
    expect(stickerIsUnavailable(state(true, null))).toBe(true);
    expect(stickerIsUnavailable(state(true, false))).toBe(false);
    expect(stickerIsUnavailable(state(true, true))).toBe(false);
  });
});

describe("matchesStampFilter", () => {
  const matrix: [StampFilterValue, boolean[]][] = [
    // order follows ALL_STATES
    ["all", [true, true, true, true, true, true]],
    ["collected", [false, false, false, true, true, true]],
    ["not-collected", [true, true, true, false, false, false]],
  ];

  it.each(matrix)("filter %s matches the expected states", (filter, expected) => {
    const actual = ALL_STATES.map((s) => matchesStampFilter(s.state, filter));
    expect(actual).toEqual(expected);
  });

  it("ignores the sticker entirely", () => {
    expect(matchesStampFilter(state(true, null), "collected")).toBe(true);
    expect(matchesStampFilter(state(true, false), "collected")).toBe(true);
    expect(matchesStampFilter(state(true, true), "collected")).toBe(true);
  });
});

describe("matchesStickerFilter", () => {
  const matrix: [StickerFilterValue, boolean[]][] = [
    // order follows ALL_STATES
    ["all", [true, true, true, true, true, true]],
    ["collected", [false, true, false, false, true, false]],
    ["not-collected", [true, false, false, true, false, false]],
    ["not-available", [false, false, true, false, false, true]],
  ];

  it.each(matrix)("filter %s matches the expected states", (filter, expected) => {
    const actual = ALL_STATES.map((s) => matchesStickerFilter(s.state, filter));
    expect(actual).toEqual(expected);
  });

  // The three known failure modes for sites that offer no марка.
  describe("sites offering no марка", () => {
    const unavailable = state(true, null);

    it("are not wrongly caught by the 'not collected' filter", () => {
      expect(matchesStickerFilter(unavailable, "not-collected")).toBe(false);
    });

    it("are not wrongly caught by the 'collected' filter", () => {
      expect(matchesStickerFilter(unavailable, "collected")).toBe(false);
    });

    it("are not wrongly dropped by the 'all' filter", () => {
      expect(matchesStickerFilter(unavailable, "all")).toBe(true);
    });

    it("are the only thing the 'not available' filter matches", () => {
      const matched = ALL_STATES.filter((s) =>
        matchesStickerFilter(s.state, "not-available"),
      );
      expect(matched.every((s) => s.state.sticker === null)).toBe(true);
      expect(matched).toHaveLength(2);
    });
  });
});

describe("narrowing filter values from the URL", () => {
  it.each(STAMP_FILTER_VALUES)("keeps the stamp value %s", (value) => {
    expect(toStampFilterValue(value)).toBe(value);
  });

  it.each(STICKER_FILTER_VALUES)("keeps the sticker value %s", (value) => {
    expect(toStickerFilterValue(value)).toBe(value);
  });

  it.each([null, "", "nonsense", "visited", "not-available"])(
    "falls back to all for the stamp value %o",
    (value) => {
      expect(toStampFilterValue(value)).toBe("all");
    },
  );

  it.each([null, "", "nonsense", "visited"])(
    "falls back to all for the sticker value %o",
    (value) => {
      expect(toStickerFilterValue(value)).toBe("all");
    },
  );
});

describe("aggregateProgress", () => {
  it("counts stamps over every site", () => {
    const progress = aggregateProgress([
      state(true, false),
      state(false, false),
      state(true, null),
    ]);

    expect(progress.stamps).toEqual({ collected: 2, total: 3 });
  });

  it("excludes sites offering no марка from the sticker denominator", () => {
    const progress = aggregateProgress([
      state(true, true),
      state(true, false),
      state(true, null),
      state(true, null),
    ]);

    expect(progress.stickers).toEqual({ collected: 1, total: 2 });
  });

  it("reaches a full sticker score when every obtainable марка is collected", () => {
    const progress = aggregateProgress([
      state(true, true),
      state(true, null),
      state(true, true),
    ]);

    expect(progress.stickers).toEqual({ collected: 2, total: 2 });
  });

  it("reports zero totals for an empty set", () => {
    expect(aggregateProgress([])).toEqual({
      stamps: { collected: 0, total: 0 },
      stickers: { collected: 0, total: 0 },
    });
  });

  it("reports a zero sticker denominator when no site offers a марка", () => {
    const progress = aggregateProgress([state(true, null), state(false, null)]);

    expect(progress.stickers).toEqual({ collected: 0, total: 0 });
  });

  it("counts a collected марка on an unstamped site", () => {
    const progress = aggregateProgress([state(false, true)]);

    expect(progress).toEqual({
      stamps: { collected: 0, total: 1 },
      stickers: { collected: 1, total: 1 },
    });
  });

  it("does not mutate the states it is given", () => {
    const states = [state(true, true), state(false, null)];
    const snapshot = structuredClone(states);

    aggregateProgress(states);

    expect(states).toEqual(snapshot);
  });
});
