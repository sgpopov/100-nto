import { CircleSlashIcon } from "lucide-react";

import { coinIsUnavailable, type CoinState } from "@/lib/coinStatus";

/**
 * "в момента" is load-bearing: a coin can start being offered again, and the
 * collector should re-check rather than write it off. The filter option says
 * the shorter "Не се предлага" because it sits among other short labels.
 */
const MESSAGE = "В момента не се предлага";

interface CoinAvailabilityProps {
  state: CoinState;
  className?: string;
}

export const CoinAvailability = ({
  state,
  className,
}: CoinAvailabilityProps) => {
  if (state.collected || !coinIsUnavailable(state)) {
    return null;
  }

  return (
    <span
      data-testid="unavailable-badge"
      className={`flex items-center justify-center gap-1 text-gray-500 ${className ?? ""}`}
    >
      <CircleSlashIcon aria-hidden="true" className="w-4 h-4 shrink-0" />
      <span className="text-xs">{MESSAGE}</span>
    </span>
  );
};
