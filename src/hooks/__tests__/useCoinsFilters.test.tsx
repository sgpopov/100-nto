import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const pushMock = vi.fn();

const searchParamsMock = {
  params: new URLSearchParams(),
  get(key: string) {
    return this.params.get(key);
  },
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn() }),
  useSearchParams: () => searchParamsMock,
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
  ],
}));

import { useCoinsFilters } from "@/hooks/useCoinsFilters";

const setSearch = (qs: string) => {
  searchParamsMock.params = new URLSearchParams(qs);
};

describe("useCoinsFilters", () => {
  beforeEach(() => {
    pushMock.mockClear();
    setSearch("");
  });

  it("returns all coins when no filters are applied", () => {
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData).toHaveLength(4);
    expect(result.current.selectedLocation).toBe("all");
    expect(result.current.collectedFilter).toBe("all");
  });

  it("filters by province", () => {
    setSearch("filters[location]=София");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["3", "4"]);
  });

  it("filters by city (location field)", () => {
    setSearch("filters[location]=Свищов");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["2"]);
  });

  it("filters by collected=yes", () => {
    setSearch("filters[collected]=yes");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["1", "3"]);
  });

  it("filters by collected=no", () => {
    setSearch("filters[collected]=no");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["2", "4"]);
  });

  it("combines location and collected filters", () => {
    setSearch("filters[location]=София&filters[collected]=yes");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.filteredData.map((c) => c.id)).toEqual(["3"]);
  });

  it("builds locationOptions with an 'all' entry, provinces, and indented cities", () => {
    const { result } = renderHook(() => useCoinsFilters());

    const opts = result.current.locationOptions.map((o) => ({
      value: o.value,
      label: o.label,
    }));

    expect(opts).toEqual([
      { value: "all", label: "Всички" },
      { value: "Велико Търново", label: "Велико Търново" },
      { value: "Велико Търново", label: "- Велико Търново" },
      { value: "Свищов", label: "- Свищов" },
      { value: "София", label: "София" },
      { value: "София", label: "- София" },
    ]);
  });

  it("returns the standard collectedFilters set", () => {
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.collectedFilters).toEqual([
      { value: "all", label: "Всички" },
      { value: "yes", label: "Да" },
      { value: "no", label: "Не" },
    ]);
  });

  it("encodes the active filters into queryString", () => {
    setSearch("filters[location]=София&filters[collected]=yes");
    const { result } = renderHook(() => useCoinsFilters());

    expect(result.current.queryString).toBe(
      `filters[location]=${encodeURIComponent("София")}&filters[collected]=yes`
    );
  });

  it("pushes the queryString to the router on mount", () => {
    setSearch("filters[location]=София");
    renderHook(() => useCoinsFilters());

    expect(pushMock).toHaveBeenCalledWith(
      `?filters[location]=${encodeURIComponent("София")}&filters[collected]=all`
    );
  });
});
