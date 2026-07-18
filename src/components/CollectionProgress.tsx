import type { CollectibleProgress, Progress } from "@/lib/collectionStatus";

/**
 * The figures cover the whole dataset and stay put while filters change: a
 * denominator that moved with the filters would read as though the collection
 * itself had shrunk. The neighbouring result count answers "how many are
 * showing".
 */
export const CollectionProgress = ({ progress }: { progress: Progress }) => (
  <span
    data-testid="collection-progress"
    className="flex gap-x-4 whitespace-nowrap"
  >
    <Collectible
      testId="stamp-progress"
      short="Печати"
      long="събрани печати"
      value={progress.stamps}
    />
    <Collectible
      testId="sticker-progress"
      short="Марки"
      long="събрани марки"
      value={progress.stickers}
    />
  </span>
);

const Collectible = ({
  testId,
  short,
  long,
  value,
}: {
  testId: string;
  short: string;
  long: string;
  value: CollectibleProgress;
}) => (
  <span data-testid={testId}>
    <span className="md:hidden">
      {short} {value.collected}/{value.total}
    </span>
    <span className="hidden md:inline">
      {long}: {value.collected} от {value.total}
    </span>
  </span>
);
