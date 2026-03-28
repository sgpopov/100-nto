import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as L from "leaflet";
import MapView, { type MapPin } from "@/components/MapView";
import type { ReactNode } from "react";

vi.mock("leaflet/dist/leaflet.css", () => ({}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L as any).divIcon = (opts: { html: string; [k: string]: unknown }) => ({
  options: { html: opts.html },
});

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  useMap: () => ({ fitBounds: vi.fn() }),
  Marker: ({
    children,
    icon,
  }: {
    children: ReactNode;
    position: [number, number];
    icon: { options: { html: string } };
  }) => (
    <div
      data-testid="marker"
      data-icon-color={icon.options.html.includes("#22c55e") ? "green" : "grey"}
    >
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}));

const makePin = (overrides: Partial<MapPin> = {}): MapPin => ({
  key: "pin-1",
  lat: 42.7,
  lng: 25.5,
  active: false,
  popup: <span>Popup content</span>,
  ...overrides,
});

describe("MapView", () => {
  it("renders the correct number of markers", () => {
    const pins = [
      makePin({ key: "a" }),
      makePin({ key: "b" }),
      makePin({ key: "c" }),
    ];
    render(<MapView pins={pins} />);

    expect(screen.getAllByTestId("marker")).toHaveLength(3);
  });

  it("gives active pins a green marker and inactive pins a grey marker", () => {
    const pins = [
      makePin({ key: "active", active: true }),
      makePin({ key: "inactive", active: false }),
    ];
    render(<MapView pins={pins} />);

    const markers = screen.getAllByTestId("marker");
    const green = markers.filter(
      (m) => m.getAttribute("data-icon-color") === "green",
    );
    const grey = markers.filter(
      (m) => m.getAttribute("data-icon-color") === "grey",
    );

    expect(green).toHaveLength(1);
    expect(grey).toHaveLength(1);
  });

  it("renders popup content for each marker", () => {
    const pins = [
      makePin({
        key: "site-1",
        popup: (
          <div>
            <span>Музей А</span>
            <a href="https://www.btsbg.org/a">BTU страница</a>
          </div>
        ),
      }),
    ];
    render(<MapView pins={pins} />);

    expect(screen.getByText("Музей А")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "BTU страница" })).toHaveAttribute(
      "href",
      "https://www.btsbg.org/a",
    );
  });

  it("renders no markers when given an empty pin list", () => {
    render(<MapView pins={[]} />);

    expect(screen.queryByTestId("marker")).toBeNull();
  });
});
