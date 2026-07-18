import { render } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import type { MapPin } from "@/components/MapView";

let capturedPins: MapPin[] = [];

vi.mock("next/dynamic", () => ({
  default: () =>
    function MockMapView({ pins }: { pins: MapPin[] }) {
      capturedPins = pins;
      return null;
    },
}));

const mockCoins = [
  {
    id: "1",
    name: "Coin A",
    url: "https://example.com/a",
    images: [{ url: "/img-a.jpg" }],
    coordinates: [25.0, 43.0],
    collected: true,
    available: true,
    province: "Велико Търново",
    location: "Велико Търново",
  },
  {
    id: "2",
    name: "Coin B",
    url: "https://example.com/b",
    images: [{ url: "/img-b.jpg" }],
    coordinates: [25.1, 43.1],
    collected: false,
    available: true,
    province: "София",
    location: "София",
  },
  {
    id: "4",
    name: "Coin A duplicate location",
    url: "https://example.com/d",
    images: [{ url: "/img-d.jpg" }],
    coordinates: [25.0, 43.0],
    collected: false,
    available: true,
    province: "Велико Търново",
    location: "Велико Търново",
  },
  {
    id: "5",
    name: "Coin E (no longer offered)",
    url: "https://example.com/e",
    images: [{ url: "/img-e.jpg" }],
    coordinates: [25.2, 43.2],
    collected: false,
    available: false,
    province: "Пловдив",
    location: "Пловдив",
  },
  // No coin in the shipped data is both collected and unavailable, so this
  // combination only exists here.
  {
    id: "6",
    name: "Coin F (collected, no longer offered)",
    url: "https://example.com/f",
    images: [{ url: "/img-f.jpg" }],
    coordinates: [25.3, 43.3],
    collected: true,
    available: false,
    province: "Пловдив",
    location: "Пловдив",
  },
  {
    id: "3",
    name: "Coin C (no coordinates)",
    url: "https://example.com/c",
    images: [{ url: "/img-c.jpg" }],
    coordinates: [],
    collected: false,
    available: true,
    province: "Варна",
    location: "Варна",
  },
];

vi.mock("../../context", () => ({
  useCoinsContext: () => ({ filteredData: mockCoins }),
}));

import CoinsMapPage from "../page";

describe("CoinsMapPage", () => {
  beforeAll(() => {
    render(<CoinsMapPage />);
  });

  describe("pin building", () => {
    it("builds one pin per geocoded coin, excluding coins with missing coordinates", () => {
      expect(capturedPins).toHaveLength(5);
    });

    it("keeps unique coordinates intact and spreads duplicate coordinates", () => {
      const uniquePin = capturedPins.find((pin) => pin.key === "2");
      const duplicateA = capturedPins.find((pin) => pin.key === "1");
      const duplicateB = capturedPins.find((pin) => pin.key === "4");

      expect(uniquePin).toMatchObject({ lat: 43.1, lng: 25.1 });
      expect(duplicateA).toBeDefined();
      expect(duplicateB).toBeDefined();
      expect(duplicateA?.lat).not.toBe(43.0);
      expect(duplicateB?.lat).not.toBe(43.0);
      expect(duplicateA?.lng).toBe(25.0);
      expect(duplicateB?.lng).toBe(25.0);
      expect(duplicateA?.lat).not.toBe(duplicateB?.lat);
    });

    it("maps collected coins to complete and uncollected to none", () => {
      expect(capturedPins[0].status).toBe("complete");
      expect(capturedPins[1].status).toBe("none");
    });

    it("maps an uncollected coin that is no longer offered to unavailable", () => {
      expect(capturedPins.find((pin) => pin.key === "5")?.status).toBe(
        "unavailable",
      );
    });

    it("keeps a collected coin complete even once it is no longer offered", () => {
      expect(capturedPins.find((pin) => pin.key === "6")?.status).toBe(
        "complete",
      );
    });

    it("never renders a coin as partially collected", () => {
      // Coins have only one collectible, so the middle status is unreachable
      // for them — this is what keeps coins behaviour unchanged.
      expect(capturedPins.every((pin) => pin.status !== "partial")).toBe(true);
    });

    it("uses coin.id as the pin key", () => {
      expect(capturedPins[0].key).toBe("1");
      expect(capturedPins[1].key).toBe("2");
    });
  });

  describe("popup content", () => {
    it("contains the coin name and a product link", () => {
      const { getByText, getByRole } = render(
        capturedPins[0].popup as React.ReactElement,
      );
      expect(getByText("Coin A")).toBeInTheDocument();
      expect(getByRole("link")).toHaveAttribute(
        "href",
        "https://example.com/a",
      );
    });

    it("shows the collected label for collected coins", () => {
      const { getByText } = render(capturedPins[0].popup as React.ReactElement);
      expect(getByText("Събрана")).toBeInTheDocument();
    });

    it("does not show the collected label for uncollected coins", () => {
      const { queryByText } = render(
        capturedPins[1].popup as React.ReactElement,
      );
      expect(queryByText("Събрана")).not.toBeInTheDocument();
    });

    it("explains why a coin that is no longer offered looks different", () => {
      const pin = capturedPins.find((p) => p.key === "5")!;
      const { getByTestId } = render(pin.popup as React.ReactElement);

      expect(getByTestId("unavailable-badge")).toHaveTextContent(
        "В момента не се предлага",
      );
    });

    it("keeps the product link usable on a coin that is no longer offered", () => {
      const pin = capturedPins.find((p) => p.key === "5")!;
      const { getByRole } = render(pin.popup as React.ReactElement);

      expect(getByRole("link")).toHaveAttribute("href", "https://example.com/e");
    });

    it("says nothing about availability for a coin that can still be collected", () => {
      const { queryByTestId } = render(
        capturedPins[1].popup as React.ReactElement,
      );

      expect(queryByTestId("unavailable-badge")).not.toBeInTheDocument();
    });
  });
});
