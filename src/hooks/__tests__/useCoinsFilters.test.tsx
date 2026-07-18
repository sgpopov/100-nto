import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const replaceMock = vi.fn();

let searchParamsRef: { get: (key: string) => string | null } = {
  get: () => null,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => searchParamsRef,
}));

vi.mock("@/data/coins.json", () => ({
  default: [
    {
      id: "1",
      name: "Coin A",
      url: "https://example.com/a",
      images: [{ url: "img-a" }],
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
      images: [{ url: "img-b" }],
      coordinates: [25.1, 43.1],
      collected: false,
      available: true,
      province: "Велико Търново",
      location: "Свищов",
    },
    {
      id: "3",
      name: "Coin C",
      url: "https://example.com/c",
      images: [{ url: "img-c" }],
      coordinates: [23.3, 42.7],
      collected: true,
      available: true,
      province: "София",
      location: "София",
    },
    {
      id: "4",
      name: "Coin D",
      url: "https://example.com/d",
      images: [{ url: "img-d" }],
      coordinates: [23.4, 42.8],
      collected: false,
      available: true,
      province: "София",
      location: "София",
    },
    {
      id: "5",
      name: "Coin E",
      url: "https://example.com/e",
      images: [{ url: "img-e" }],
      coordinates: [23.5, 42.9],
      collected: false,
      available: false,
      province: "София",
      location: "София",
    },
    // No coin in the shipped data is both collected and unavailable; the
    // fixture carries one so the independence of the two axes is exercised.
    {
      id: "6",
      name: "Coin F",
      url: "https://example.com/f",
      images: [{ url: "img-f" }],
      coordinates: [25.2, 43.2],
      collected: true,
      available: false,
      province: "Велико Търново",
      location: "Свищов",
    },
  ],
}));

import { useCoinsFilters } from "@/hooks/useCoinsFilters";

const setSearch = (qs: string) => {
  const params = new URLSearchParams(qs);
  searchParamsRef = { get: (key: string) => params.get(key) };
};

describe("useCoinsFilters", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    setSearch("");
  });

  it("returns all coins when no filters are applied", () => {
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData).toHaveLength(6);
    expect(result.current.selectedLocation).toBe("all");
    expect(result.current.collectedFilter).toBe("all");
  });

  it("filters by province", () => {
    setSearch("filters[location]=София");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual([
      "3",
      "4",
      "5",
    ]);
  });

  it("filters by city (location field)", () => {
    setSearch("filters[location]=Свищов");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["2", "6"]);
  });

  it("filters by collected", () => {
    setSearch("filters[collected]=collected");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual([
      "1",
      "3",
      "6",
    ]);
  });

  it("leaves coins that cannot be obtained out of the not-collected list", () => {
    setSearch("filters[collected]=not-collected");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["2", "4"]);
  });

  it("filters by not-available regardless of whether the coin is collected", () => {
    setSearch("filters[collected]=not-available");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["5", "6"]);
  });

  it("falls back to all for a link bookmarked with the old yes value", () => {
    setSearch("filters[collected]=yes");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.collectedFilter).toBe("all");
    expect(result.current.filteredData).toHaveLength(6);
  });

  it("falls back to all for an unrecognised value", () => {
    setSearch("filters[collected]=nonsense");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.collectedFilter).toBe("all");
    expect(result.current.filteredData).toHaveLength(6);
  });

  it("combines location and collected filters", () => {
    setSearch("filters[location]=София&filters[collected]=collected");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["3"]);
  });

  it("composes the location filter with the availability narrowing", () => {
    setSearch("filters[location]=София&filters[collected]=not-collected");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["4"]);
  });

  it("composes the location filter with not-available", () => {
    setSearch("filters[location]=София&filters[collected]=not-available");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["5"]);
  });

  it("builds locationsByProvince grouped by province with nested cities", () => {
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.locationsByProvince).toEqual([
      {
        value: "Велико Търново",
        label: "Велико Търново",
        cities: [
          { value: "Велико Търново", label: "Велико Търново" },
          { value: "Свищов", label: "Свищов" },
        ],
      },
      {
        value: "София",
        label: "София",
        cities: [{ value: "София", label: "София" }],
      },
    ]);
  });

  it("returns the standard collectedFilters set", () => {
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.collectedFilters).toEqual([
      { value: "all", label: "Всички" },
      { value: "collected", label: "Да" },
      { value: "not-collected", label: "Не" },
      { value: "not-available", label: "Не се предлага" },
    ]);
  });

  it("encodes the active filters into queryString", () => {
    setSearch("filters[location]=София&filters[collected]=collected");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.queryString).toBe(
      `filters[location]=${encodeURIComponent("София")}&filters[collected]=collected`,
    );
  });

  it("does not call router.replace on mount", () => {
    renderHook(() => useCoinsFilters());

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("calls router.replace when setSelectedLocation is called", () => {
    const { result } = renderHook(() => useCoinsFilters());

    result.current.setSelectedLocation("София");

    expect(replaceMock).toHaveBeenCalledWith(
      `?filters[location]=${encodeURIComponent("София")}&filters[collected]=all`,
    );
  });

  it("calls router.replace when setCollectedFilter is called", () => {
    const { result } = renderHook(() => useCoinsFilters());

    result.current.setCollectedFilter("not-available");

    expect(replaceMock).toHaveBeenCalledWith(
      `?filters[location]=all&filters[collected]=not-available`,
    );
  });

  it("normalises an unsupported value instead of writing it to the URL", () => {
    const { result } = renderHook(() => useCoinsFilters());

    result.current.setCollectedFilter("yes");

    expect(replaceMock).toHaveBeenCalledWith(
      `?filters[location]=all&filters[collected]=all`,
    );
  });

  it("reflects updated URL params on re-render (back/forward navigation)", () => {
    const { result, rerender } = renderHook(() => useCoinsFilters());

    expect(result.current.selectedLocation).toBe("all");
    expect(result.current.collectedFilter).toBe("all");

    setSearch("filters[location]=София&filters[collected]=collected");
    rerender();

    expect(result.current.selectedLocation).toBe("София");
    expect(result.current.collectedFilter).toBe("collected");
  });
});
