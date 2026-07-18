import { BadgeCheckIcon, SquareSlashIcon, StickerIcon } from "lucide-react";

import {
  stickerIsUnavailable,
  type CollectionState,
} from "@/lib/collectionStatus";

/**
 * The icon trio for a site's печат and марка.
 *
 * Shared by the list view and the map popup so the two presentations cannot
 * drift apart. The popup matters in particular: pin colour deliberately reads
 * "марка collected" and "no марка offered" as the same complete state, so these
 * icons are the only place that distinction surfaces.
 *
 * Icons are presence-based — an item that is not collected renders nothing at
 * all, rather than a dimmed icon. At this size a faded icon reads as a
 * different icon, not as an absent one.
 */
interface CollectionIconsProps {
  state: CollectionState;
  className?: string;
}

// Colour is inherited so each consumer can sit the trio on its own background —
// white over a photograph in the list, dark ink in the map popup.
const iconClass = "w-5 h-5";

export const CollectionIcons = ({ state, className }: CollectionIconsProps) => {
  return (
    <span className={className}>
      {state.stamp && (
        <BadgeCheckIcon
          role="img"
          aria-label="Събран печат"
          data-testid="stamp-icon"
          className={iconClass}
        >
          <title>Събран печат</title>
        </BadgeCheckIcon>
      )}

      {state.sticker === true && (
        <StickerIcon
          role="img"
          aria-label="Събрана марка"
          data-testid="sticker-icon"
          className={iconClass}
        >
          <title>Събрана марка</title>
        </StickerIcon>
      )}

      {stickerIsUnavailable(state) && (
        <SquareSlashIcon
          role="img"
          aria-label="Няма марка за този обект"
          data-testid="sticker-unavailable-icon"
          className={iconClass}
        >
          <title>Няма марка за този обект</title>
        </SquareSlashIcon>
      )}
    </span>
  );
};
