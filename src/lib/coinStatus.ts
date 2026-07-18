/**
 * `available` is a present-tense stock fact that may reverse. Despite sharing
 * the label "не се предлага" with a site's `null` марка, it is not the same
 * concept: the марка case is permanent, this one is a snapshot.
 */

export type CoinState = {
  collected: boolean;
  available: boolean;
};

export type CoinStatus = "collected" | "not-collected" | "unavailable";

export const COIN_FILTER_VALUES = [
  "all",
  "collected",
  "not-collected",
  "not-available",
] as const;

export type CoinFilterValue = (typeof COIN_FILTER_VALUES)[number];

export function toCoinFilterValue(value: string | null): CoinFilterValue {
  return COIN_FILTER_VALUES.includes(value as CoinFilterValue)
    ? (value as CoinFilterValue)
    : "all";
}

export function coinIsUnavailable(state: CoinState): boolean {
  return !state.available;
}

export function matchesCoinFilter(
  state: CoinState,
  filter: CoinFilterValue,
): boolean {
  switch (filter) {
    case "collected":
      return state.collected;
    // Coins that cannot be obtained are excluded deliberately: this is the
    // trip-planning list, and it must only contain achievable things.
    case "not-collected":
      return !state.collected && !coinIsUnavailable(state);
    // Availability is read on its own axis, so an owned coin that is no longer
    // offered still answers this filter.
    case "not-available":
      return coinIsUnavailable(state);
    default:
      return true;
  }
}

/** Collected wins over unavailable: a single display slot must choose, and
 *  owning the coin is the more useful signal. The availability text is driven
 *  by `coinIsUnavailable` instead, so both facts still reach the collector. */
export function deriveCoinStatus(state: CoinState): CoinStatus {
  if (state.collected) {
    return "collected";
  }

  return coinIsUnavailable(state) ? "unavailable" : "not-collected";
}
