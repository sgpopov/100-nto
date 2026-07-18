import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { CollectionProgress } from "@/components/CollectionProgress";
import { aggregateProgress } from "@/lib/collectionStatus";

describe("CollectionProgress", () => {
  it("shows both figures in the narrow and the wide phrasing", () => {
    render(
      <CollectionProgress
        progress={{
          stamps: { collected: 3, total: 10 },
          stickers: { collected: 1, total: 7 },
        }}
      />,
    );

    expect(screen.getByTestId("stamp-progress")).toHaveTextContent(
      "Печати 3/10събрани печати: 3 от 10",
    );
    expect(screen.getByTestId("sticker-progress")).toHaveTextContent(
      "Марки 1/7събрани марки: 1 от 7",
    );
  });

  // Guards the whole chain: a marka-less site must not inflate the denominator
  // the component prints.
  it("prints a марка denominator that omits sites offering no марка", () => {
    render(
      <CollectionProgress
        progress={aggregateProgress([
          { stamp: true, sticker: true },
          { stamp: true, sticker: false },
          { stamp: false, sticker: null },
        ])}
      />,
    );

    expect(screen.getByTestId("sticker-progress")).toHaveTextContent(
      "събрани марки: 1 от 2",
    );
    expect(screen.getByTestId("stamp-progress")).toHaveTextContent(
      "събрани печати: 2 от 3",
    );
  });
});
