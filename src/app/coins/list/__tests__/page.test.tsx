import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const mockCoins = [
  {
    id: "1",
    name: "Coin A",
    url: "https://example.com/a",
    images: [{ url: "/img-a.jpg" }],
    coordinates: [25.0, 43.0],
    collected: false,
    available: true,
    province: "Велико Търново",
    location: "Велико Търново",
  },
  {
    id: "2",
    name: "Coin B (no image, no product page)",
    url: undefined,
    images: [],
    coordinates: [25.1, 43.1],
    collected: true,
    available: true,
    province: "Смолян",
    location: "Смолян",
  },
];

vi.mock("../../context", () => ({
  useCoinsContext: () => ({ filteredData: mockCoins }),
}));

import CoinsListPage from "../page";

const cardFor = (name: string) =>
  screen.getByRole("heading", { name }).closest("li")!;

describe("CoinsListPage", () => {
  it("links a coin's image to its product page", () => {
    render(<CoinsListPage />);
    const card = within(cardFor("Coin A"));

    expect(card.getByRole("link")).toHaveAttribute(
      "href",
      "https://example.com/a",
    );
    expect(card.getByAltText("Coin image for Coin A")).toBeInTheDocument();
  });

  it("shows a placeholder and no link for a coin without an image or product page", () => {
    render(<CoinsListPage />);
    const card = within(cardFor("Coin B (no image, no product page)"));

    expect(card.getByTestId("coin-image-placeholder")).toBeInTheDocument();
    expect(card.queryByRole("link")).not.toBeInTheDocument();
  });
});
