import { BadgeCheckIcon, SquareSlashIcon, StickerIcon } from "lucide-react";

import {
  stickerIsUnavailable,
  type CollectionState,
} from "@/lib/collectionStatus";

/**
 * Shared by the list view and the map popup: pin colour reads "марка collected"
 * and "no марка offered" as the same complete state, so these icons are the only
 * place that distinction surfaces.
 *
 * An uncollected item renders nothing rather than a dimmed icon — at this size a
 * faded icon reads as a different icon, not as an absent one.
 */
interface CollectionIconsProps {
  state: CollectionState;
  className?: string;
}

// Colour is inherited so each consumer can set it for its own background.
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
