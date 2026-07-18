import { RotateCcwIcon } from "lucide-react";

/**
 * Shared by the sites and the coins views so the two cannot drift apart.
 *
 * Two independent conditions: the total joins the count only once the list is
 * actually narrower, and the reset control appears only once something is
 * filtered. A filter that happens to match everything — every печат collected,
 * say — is still active, but "246 от 246" would be the noise this avoids.
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
      {shown === total ? (
        <>
          {total} {noun(total)}
        </>
      ) : (
        <>
          <span className="font-medium text-gray-900">{shown}</span>{" "}
          {noun(shown)} от {total}
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
