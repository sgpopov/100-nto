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

export function coinIsUnavailable(state: CoinState): boolean {
  return !state.available;
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
