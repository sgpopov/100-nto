import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { FilterSummary } from "@/components/FilterSummary";

const results = () => screen.getByTestId("filter-results");
const clearButton = () => screen.queryByRole("button", { name: "Изчисти" });

describe("FilterSummary", () => {
  it("reports the total alone when nothing is narrowed", () => {
    render(<FilterSummary shown={246} total={246} />);

    expect(results()).toHaveTextContent("246 резултата");
    expect(results()).not.toHaveTextContent("от");
  });

  it("reports a narrowed list against the full total", () => {
    render(<FilterSummary shown={5} total={246} onClear={() => {}} />);

    expect(results()).toHaveTextContent("5 резултата от 246");
  });

  it("uses the singular noun for a single result", () => {
    render(<FilterSummary shown={1} total={246} onClear={() => {}} />);

    expect(results()).toHaveTextContent("1 резултат от 246");
  });

  // A filter can be active and still match everything — every печат collected
  // is the goal state, not an edge case — and the total would be noise there.
  it("omits the total when an active filter matches everything", () => {
    render(<FilterSummary shown={246} total={246} onClear={() => {}} />);

    expect(results()).toHaveTextContent("246 резултата");
    expect(results()).not.toHaveTextContent("от 246");
    expect(clearButton()).toBeInTheDocument();
  });

  it("offers no reset control until something is filtered", () => {
    render(<FilterSummary shown={246} total={246} />);

    expect(clearButton()).not.toBeInTheDocument();
  });

  it("resets through the supplied handler", () => {
    const onClear = vi.fn();
    render(<FilterSummary shown={5} total={246} onClear={onClear} />);

    fireEvent.click(clearButton()!);

    expect(onClear).toHaveBeenCalledOnce();
  });
});
