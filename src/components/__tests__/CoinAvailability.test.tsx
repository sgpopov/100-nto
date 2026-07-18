import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CoinAvailability } from "@/components/CoinAvailability";
import type { CoinState } from "@/lib/coinStatus";

const state = (collected: boolean, available: boolean): CoinState => ({
  collected,
  available,
});

const MESSAGE = "В момента не се предлага";

describe("CoinAvailability", () => {
  it("tells an uncollected coin that is no longer offered why it differs", () => {
    render(<CoinAvailability state={state(false, false)} />);

    expect(screen.getByTestId("unavailable-badge")).toBeInTheDocument();
    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
  });

  it("says nothing about a coin that can still be collected", () => {
    render(<CoinAvailability state={state(false, true)} />);

    expect(screen.queryByTestId("unavailable-badge")).toBeNull();
  });

  it("says nothing about a collected coin", () => {
    render(<CoinAvailability state={state(true, true)} />);

    expect(screen.queryByTestId("unavailable-badge")).toBeNull();
  });

  // The collected-and-unavailable case is a later slice; until then a collected
  // coin stays silent, matching what the pin already does.
  it("stays silent on a collected coin that is no longer offered", () => {
    render(<CoinAvailability state={state(true, false)} />);

    expect(screen.queryByTestId("unavailable-badge")).toBeNull();
  });

  it("keeps the temporal qualifier, so the collector re-checks rather than gives up", () => {
    render(<CoinAvailability state={state(false, false)} />);

    expect(screen.getByTestId("unavailable-badge").textContent).toContain(
      "В момента",
    );
  });
});
