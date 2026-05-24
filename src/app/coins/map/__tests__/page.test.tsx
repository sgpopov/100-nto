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
      expect(capturedPins).toHaveLength(3);
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

    it("sets active=true for collected coins and false for uncollected", () => {
      expect(capturedPins[0].active).toBe(true);
      expect(capturedPins[1].active).toBe(false);
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
  });
});
