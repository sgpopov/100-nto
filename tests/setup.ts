import { vi } from "vitest";
import "@testing-library/jest-dom";

// Leaflet mock - prevents window/DOM errors when rendering map components in jsdom
vi.mock("leaflet", () => ({
  default: {
    map: vi.fn(() => ({
      setView: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
    })),
    icon: vi.fn(() => ({})),
    divIcon: vi.fn((opts: { html: string }) => ({ options: { html: opts.html } })),
    latLngBounds: vi.fn(() => ({})),
    Icon: {
      Default: {
        mergeOptions: vi.fn(),
        prototype: {},
      },
    },
  },
}));
