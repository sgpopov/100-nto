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

  // The <title> differs per icon, so comparing innerHTML would pass even for
  // identical glyphs. Compare the drawn geometry only.
  const geometry = (root: HTMLElement, testId: string) =>
    Array.from(root.querySelectorAll(`[data-testid='${testId}'] > *`))
      .filter((el) => el.tagName !== "title")
      .map((el) => el.outerHTML)
      .join("");

  it("renders each icon as a distinct shape", () => {
    const { container, rerender } = render(
      <CollectionIcons state={state(true, true)} />,
    );

    const stamp = geometry(container, "stamp-icon");
    const sticker = geometry(container, "sticker-icon");

    rerender(<CollectionIcons state={state(false, null)} />);
    const unavailable = geometry(container, "sticker-unavailable-icon");

    expect(stamp).not.toBe("");
    expect(sticker).not.toBe("");
    expect(unavailable).not.toBe("");

    expect(stamp).not.toBe(sticker);
    expect(stamp).not.toBe(unavailable);
    expect(sticker).not.toBe(unavailable);
  });

  it("labels every icon in Bulgarian for screen readers", () => {
    const { rerender } = render(<CollectionIcons state={state(true, true)} />);

    expect(screen.getByRole("img", { name: "Събран печат" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Събрана марка" })).toBeTruthy();

    rerender(<CollectionIcons state={state(true, null)} />);

    expect(
      screen.getByRole("img", { name: "Няма марка за този обект" }),
    ).toBeTruthy();
  });
});
