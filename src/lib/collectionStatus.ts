/**
 * The single place that interprets a site's печат (stamp) and марка (sticker).
 *
 * Pure and framework-free by design: the three-state sticker has several
 * plausible-but-wrong readings, so every consumer — the filters hook, the list
 * view, the map and the layout — asks this module rather than testing the
 * fields itself.
 */

/** `true` collected, `false` not collected, `null` не се предлага on this site. */
export type StickerState = boolean | null;

export type CollectionState = {
  stamp: boolean;
  sticker: StickerState;
};

export type CollectionStatus = "none" | "partial" | "complete";

export const STAMP_FILTER_VALUES = [
  "all",
  "collected",
  "not-collected",
] as const;

export type StampFilterValue = (typeof STAMP_FILTER_VALUES)[number];

export const STICKER_FILTER_VALUES = [
  "all",
  "collected",
  "not-collected",
  "not-available",
] as const;

export type StickerFilterValue = (typeof STICKER_FILTER_VALUES)[number];

export function toStampFilterValue(value: string | null): StampFilterValue {
  return STAMP_FILTER_VALUES.includes(value as StampFilterValue)
    ? (value as StampFilterValue)
    : "all";
}

export function toStickerFilterValue(value: string | null): StickerFilterValue {
  return STICKER_FILTER_VALUES.includes(value as StickerFilterValue)
    ? (value as StickerFilterValue)
    : "all";
}

export type CollectibleProgress = {
  collected: number;
  total: number;
};

export type Progress = {
  stamps: CollectibleProgress;
  stickers: CollectibleProgress;
};

export function stickerIsUnavailable(state: CollectionState): boolean {
  return state.sticker === null;
}

/** A site offering no марка reads as complete once stamped — the collector has
 *  everything obtainable there, and marking it unfinished would be permanent. */
export function deriveStatus(state: CollectionState): CollectionStatus {
  const hasSticker = state.sticker === true;

  if (state.stamp && (hasSticker || stickerIsUnavailable(state))) {
    return "complete";
  }

  if (state.stamp || hasSticker) {
    return "partial";
  }

  return "none";
}

export function matchesStampFilter(
  state: CollectionState,
  filter: StampFilterValue,
): boolean {
  switch (filter) {
    case "collected":
      return state.stamp;
    case "not-collected":
      return !state.stamp;
    default:
      return true;
  }
}

export function matchesStickerFilter(
  state: CollectionState,
  filter: StickerFilterValue,
): boolean {
  switch (filter) {
    case "collected":
      return state.sticker === true;
    // Sites offering no марка are excluded deliberately: this is the
    // trip-planning list, and it must only contain achievable things.
    case "not-collected":
      return state.sticker === false;
    case "not-available":
      return stickerIsUnavailable(state);
    default:
      return true;
  }
}

/** The sticker denominator excludes sites offering no марка, so 100% stays
 *  reachable. */
export function aggregateProgress(states: CollectionState[]): Progress {
  return states.reduce<Progress>(
    (progress, state) => {
      progress.stamps.total += 1;
      if (state.stamp) progress.stamps.collected += 1;

      if (!stickerIsUnavailable(state)) {
        progress.stickers.total += 1;
        if (state.sticker === true) progress.stickers.collected += 1;
      }

      return progress;
    },
    {
      stamps: { collected: 0, total: 0 },
      stickers: { collected: 0, total: 0 },
    },
  );
}
