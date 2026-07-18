import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as L from "leaflet";
import MapView, { type MapPin } from "@/components/MapView";
import type { ReactNode } from "react";

vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("leaflet.fullscreen", () => ({
  FullScreen: class FullScreen {},
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(L as any).divIcon = (opts: { html: string; [k: string]: unknown }) => ({
  options: { html: opts.html },
});

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  useMap: () => ({
    fitBounds: vi.fn(),
    addControl: vi.fn(),
    removeControl: vi.fn(),
    fullscreenControl: undefined,
  }),
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
      // Read back the status the pin published rather than its colour, so
      // these tests survive a change of palette.
      data-pin-status={
        /data-pin-status="([^"]+)"/.exec(icon.options.html)?.[1] ?? "unknown"
      }
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
  status: "none",
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

  it("publishes each of the three statuses on its marker", () => {
    const pins = [
      makePin({ key: "none", status: "none" }),
      makePin({ key: "partial", status: "partial" }),
      makePin({ key: "complete", status: "complete" }),
    ];
    render(<MapView pins={pins} />);

    const statuses = screen
      .getAllByTestId("marker")
      .map((m) => m.getAttribute("data-pin-status"));

    expect(statuses).toEqual(["none", "partial", "complete"]);
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
