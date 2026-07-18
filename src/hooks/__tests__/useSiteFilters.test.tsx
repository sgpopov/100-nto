import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const pushMock = vi.fn();

let searchParamsRef: { get: (key: string) => string | null } = {
  get: () => null,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsRef,
}));

const site = (
  name: string,
  stamp: boolean,
  sticker: boolean | null,
  extra: Record<string, unknown> = {},
) => ({
  name,
  number: "1",
  image: `/${name}.jpg`,
  link: `https://example.com/${name}`,
  stamp,
  sticker,
  lat: 42.7,
  lng: 25.5,
  ...extra,
});

vi.mock("@/data/places.json", () => ({
  default: [
    {
      city: "Банско",
      region: "Благоевградска област",
      sites: [
        site("Стамп само", true, false),
        site("Нищо", false, false),
      ],
    },
    {
      city: "Разлог",
      region: "Благоевградска област",
      sites: [site("Пълен", true, true)],
    },
    {
      city: "Свищов",
      region: "Великотърновска област",
      sites: [site("Без марка", true, null), site("Празен", false, false)],
    },
  ],
}));

const { useSiteFilters } = await import("@/hooks/useSiteFilters");

const withParams = (params: Record<string, string>) => {
  searchParamsRef = { get: (key: string) => params[key] ?? null };
};

const siteNames = (
  data: { sites: { name: string }[] }[],
): string[] => data.flatMap((city) => city.sites.map((s) => s.name));

describe("useSiteFilters", () => {
  beforeEach(() => {
    pushMock.mockClear();
    searchParamsRef = { get: () => null };
  });

  describe("stamp filter", () => {
    it("shows every site by default", () => {
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toHaveLength(5);
    });

    it("narrows to stamped sites", () => {
      withParams({ "filters[stamp]": "collected" });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Стамп само",
        "Пълен",
        "Без марка",
      ]);
    });

    it("narrows to unstamped sites", () => {
      withParams({ "filters[stamp]": "not-collected" });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Нищо",
        "Празен",
      ]);
    });

    it("drops cities left with no matching sites", () => {
      withParams({ "filters[stamp]": "not-collected" });
      const { result } = renderHook(() => useSiteFilters());

      expect(
        result.current.filteredData.map((city) => city.city),
      ).toEqual(["Банско", "Свищов"]);
    });
  });

  describe("composition with the location filter", () => {
    it("combines a region with the stamp filter", () => {
      withParams({
        "filters[location]": "Благоевградска област",
        "filters[stamp]": "collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Стамп само",
        "Пълен",
      ]);
    });

    it("combines a city with the stamp filter", () => {
      withParams({
        "filters[location]": "Свищов",
        "filters[stamp]": "collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual(["Без марка"]);
    });

    it("returns nothing when the two filters have no overlap", () => {
      withParams({
        "filters[location]": "Разлог",
        "filters[stamp]": "not-collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.filteredData).toEqual([]);
    });
  });

  describe("query string round trip", () => {
    it("reflects the defaults", () => {
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.queryString).toBe(
        "filters[location]=all&filters[stamp]=all",
      );
    });

    it("reads both filters back out of the URL", () => {
      withParams({
        "filters[location]": "Банско",
        "filters[stamp]": "collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.selectedLocation).toBe("Банско");
      expect(result.current.stampFilter).toBe("collected");
      expect(result.current.queryString).toBe(
        `filters[location]=${encodeURIComponent("Банско")}&filters[stamp]=collected`,
      );
    });

    it("carries a selection made after mount into the query string", () => {
      const { result } = renderHook(() => useSiteFilters());

      act(() => result.current.setStampFilter("collected"));

      expect(result.current.stampFilter).toBe("collected");
      expect(result.current.queryString).toContain("filters[stamp]=collected");
    });

    it("pushes the query string so the selection survives a view switch", () => {
      withParams({ "filters[stamp]": "collected" });
      renderHook(() => useSiteFilters());

      expect(pushMock).toHaveBeenCalledWith(
        "?filters[location]=all&filters[stamp]=collected",
      );
    });
  });

  describe("the removed visited parameter", () => {
    it("is ignored, leaving the stamp filter at its default", () => {
      withParams({ "filters[visited]": "visited" });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.stampFilter).toBe("all");
      expect(siteNames(result.current.filteredData)).toHaveLength(5);
    });

    it("does not reappear in the query string", () => {
      withParams({ "filters[visited]": "visited" });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.queryString).not.toContain("visited");
    });
  });

  it("falls back to the default for an unrecognised stamp value", () => {
    withParams({ "filters[stamp]": "nonsense" });
    const { result } = renderHook(() => useSiteFilters());

    expect(result.current.stampFilter).toBe("all");
    expect(siteNames(result.current.filteredData)).toHaveLength(5);
  });

  it("groups cities under their region for the location filter", () => {
    const { result } = renderHook(() => useSiteFilters());

    expect(result.current.citiesByRegion).toEqual([
      {
        value: "Благоевградска област",
        label: "Благоевградска област",
        cities: [
          { value: "Банско", label: "Банско" },
          { value: "Разлог", label: "Разлог" },
        ],
      },
      {
        value: "Великотърновска област",
        label: "Великотърновска област",
        cities: [{ value: "Свищов", label: "Свищов" }],
      },
    ]);
  });
});
