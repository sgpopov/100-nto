import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { CollectionIcons } from "@/components/CollectionIcons";
import type { CollectionState } from "@/lib/collectionStatus";

const state = (stamp: boolean, sticker: boolean | null): CollectionState => ({
  stamp,
  sticker,
});

const stamp = () => screen.queryByTestId("stamp-icon");
const sticker = () => screen.queryByTestId("sticker-icon");
const unavailable = () => screen.queryByTestId("sticker-unavailable-icon");

describe("CollectionIcons", () => {
  it("shows nothing for a site with neither collectible", () => {
    render(<CollectionIcons state={state(false, false)} />);

    expect(stamp()).toBeNull();
    expect(sticker()).toBeNull();
    expect(unavailable()).toBeNull();
  });

  it("shows only the печат when the марка is still outstanding", () => {
    render(<CollectionIcons state={state(true, false)} />);

    expect(stamp()).not.toBeNull();
    expect(sticker()).toBeNull();
    expect(unavailable()).toBeNull();
  });

  it("shows both icons when both collectibles are in hand", () => {
    render(<CollectionIcons state={state(true, true)} />);

    expect(stamp()).not.toBeNull();
    expect(sticker()).not.toBeNull();
    expect(unavailable()).toBeNull();
  });

  it("shows the unavailable icon, and no марка icon, where no марка is offered", () => {
    render(<CollectionIcons state={state(true, null)} />);

    expect(stamp()).not.toBeNull();
    expect(sticker()).toBeNull();
    expect(unavailable()).not.toBeNull();
  });

  it("shows the unavailable icon even before the печат is collected", () => {
    render(<CollectionIcons state={state(false, null)} />);

    expect(stamp()).toBeNull();
    expect(unavailable()).not.toBeNull();
  });

  it("shows a марка collected without its печат", () => {
    render(<CollectionIcons state={state(false, true)} />);

    expect(stamp()).toBeNull();
    expect(sticker()).not.toBeNull();
  });

  it("renders each icon as a distinct shape", () => {
    const { container } = render(<CollectionIcons state={state(true, true)} />);
    const { container: absent } = render(
      <CollectionIcons state={state(false, null)} />,
    );

    const paths = (root: HTMLElement, testId: string) =>
      root.querySelector(`[data-testid='${testId}']`)?.innerHTML;

    expect(paths(container, "stamp-icon")).not.toBe(
      paths(container, "sticker-icon"),
    );
    expect(paths(container, "stamp-icon")).not.toBe(
      paths(absent, "sticker-unavailable-icon"),
    );
  });

  it("labels every icon in Bulgarian for screen readers", () => {
    render(<CollectionIcons state={state(true, true)} />);

    expect(screen.getByRole("img", { name: "Събран печат" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Събрана марка" })).toBeTruthy();

    render(<CollectionIcons state={state(true, null)} />);

    expect(
      screen.getByRole("img", { name: "Няма марка за този обект" }),
    ).toBeTruthy();
  });
});
