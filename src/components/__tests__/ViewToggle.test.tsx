import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ViewToggle from "@/components/ViewToggle";
import type { ReactNode } from "react";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ViewToggle", () => {
  it("renders both options", () => {
    render(<ViewToggle currentView="list" listHref="/" mapHref="/sites/map" />);

    expect(screen.getByText("Списък")).toBeInTheDocument();
    expect(screen.getByText("Списък")).toHaveAttribute("href", "/");

    expect(screen.getByText("Карта")).toBeInTheDocument();
    expect(screen.getByText("Карта")).toHaveAttribute("href", "/sites/map");
  });

  it("highlights List View when currentView is list", () => {
    render(<ViewToggle currentView="list" listHref="/" mapHref="/sites/map" />);

    const listLink = screen.getByText("Списък");
    const mapLink = screen.getByText("Карта");

    expect(listLink).toHaveAttribute("aria-current", "page");
    expect(mapLink).not.toHaveAttribute("aria-current");
  });

  it("highlights Map View when currentView is map", () => {
    render(<ViewToggle currentView="map" listHref="/" mapHref="/sites/map" />);

    const listLink = screen.getByText("Списък");
    const mapLink = screen.getByText("Карта");

    expect(mapLink).toHaveAttribute("aria-current", "page");
    expect(listLink).not.toHaveAttribute("aria-current");
  });
});
