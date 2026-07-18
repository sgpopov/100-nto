import { RotateCcwIcon } from "lucide-react";

/**
 * Shared by the sites and the coins views so the two cannot drift apart.
 *
 * The total is only shown once a filter narrows the list — at rest "246 от 246"
 * is noise. `onClear` is omitted when nothing is filtered, so the reset control
 * never sits there dead.
 */
export const FilterSummary = ({
  shown,
  total,
  onClear,
}: {
  shown: number;
  total: number;
  onClear?: () => void;
}) => (
  <div className="flex items-center gap-x-4">
    <span data-testid="filter-results" className="text-sm text-gray-500">
      {onClear ? (
        <>
          <span className="font-medium text-gray-900">{shown}</span>{" "}
          {noun(shown)} от {total}
        </>
      ) : (
        <>
          {total} {noun(total)}
        </>
      )}
    </span>

    {onClear && (
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-x-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <RotateCcwIcon className="size-4 shrink-0" />
        Изчисти
      </button>
    )}
  </div>
);

const noun = (count: number) => (count === 1 ? "резултат" : "резултата");
