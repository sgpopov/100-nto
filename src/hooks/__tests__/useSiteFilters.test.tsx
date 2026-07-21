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
    replaceMock.mockClear();
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

  // The fixture holds one site per collection state the sticker filter can
  // distinguish: collected, not collected, and не се предлага.
  describe("sticker filter", () => {
    it("shows every site by default, including the one offering no марка", () => {
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Стамп само",
        "Нищо",
        "Пълен",
        "Без марка",
        "Празен",
      ]);
    });

    it("narrows to sites with a collected марка", () => {
      withParams({ "filters[sticker]": "collected" });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual(["Пълен"]);
    });

    it("narrows to sites still missing an obtainable марка", () => {
      withParams({ "filters[sticker]": "not-collected" });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Стамп само",
        "Нищо",
        "Празен",
      ]);
    });

    it("returns exactly the sites offering no марка", () => {
      withParams({ "filters[sticker]": "not-available" });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual(["Без марка"]);
    });

    // Deliberate, not a defect: a site offering no марка is reachable only
    // through the dedicated option, so it falls out of both other views.
    it("leaves sites offering no марка out of both collected and not-collected", () => {
      withParams({ "filters[sticker]": "collected" });
      const { result: collected } = renderHook(() => useSiteFilters());

      withParams({ "filters[sticker]": "not-collected" });
      const { result: notCollected } = renderHook(() => useSiteFilters());

      const covered = [
        ...siteNames(collected.current.filteredData),
        ...siteNames(notCollected.current.filteredData),
      ];

      expect(covered).toHaveLength(4);
      expect(covered).not.toContain("Без марка");
    });

    it("drops cities left with no matching sites", () => {
      withParams({ "filters[sticker]": "not-available" });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.filteredData.map((city) => city.city)).toEqual([
        "Свищов",
      ]);
    });

    it("offers exactly the four options", () => {
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.stickerFilters.map((o) => o.value)).toEqual([
        "all",
        "collected",
        "not-collected",
        "not-available",
      ]);
    });
  });

  describe("composition of the stamp and sticker filters", () => {
    // The combination the feature exists for: the trip-planning list of sites
    // where a марка is still achievable.
    it("isolates stamped sites still missing a марка", () => {
      withParams({
        "filters[stamp]": "collected",
        "filters[sticker]": "not-collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual(["Стамп само"]);
    });

    it("isolates fully collected sites", () => {
      withParams({
        "filters[stamp]": "collected",
        "filters[sticker]": "collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual(["Пълен"]);
    });

    it("isolates unstamped sites still missing a марка", () => {
      withParams({
        "filters[stamp]": "not-collected",
        "filters[sticker]": "not-collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Нищо",
        "Празен",
      ]);
    });

    it("returns nothing when the two filters have no overlap", () => {
      withParams({
        "filters[stamp]": "not-collected",
        "filters[sticker]": "not-available",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.filteredData).toEqual([]);
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

    it("combines a region with the sticker filter", () => {
      withParams({
        "filters[location]": "Благоевградска област",
        "filters[sticker]": "not-collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual([
        "Стамп само",
        "Нищо",
      ]);
    });

    it("ANDs the location, stamp and sticker filters together", () => {
      withParams({
        "filters[location]": "Благоевградска област",
        "filters[stamp]": "collected",
        "filters[sticker]": "not-collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(siteNames(result.current.filteredData)).toEqual(["Стамп само"]);
    });

    // Свищов holds the only site offering no марка, so the region next to it
    // must come back empty.
    it("returns nothing when the location excludes the sticker match", () => {
      withParams({
        "filters[location]": "Благоевградска област",
        "filters[sticker]": "not-available",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.filteredData).toEqual([]);
    });
  });

  describe("query string round trip", () => {
    it("reflects the defaults", () => {
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.queryString).toBe(
        "filters[location]=all&filters[stamp]=all&filters[sticker]=all",
      );
    });

    it("reads every filter back out of the URL", () => {
      withParams({
        "filters[location]": "Банско",
        "filters[stamp]": "collected",
        "filters[sticker]": "not-collected",
      });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.selectedLocation).toBe("Банско");
      expect(result.current.stampFilter).toBe("collected");
      expect(result.current.stickerFilter).toBe("not-collected");
      expect(result.current.queryString).toBe(
        `filters[location]=${encodeURIComponent("Банско")}&filters[stamp]=collected&filters[sticker]=not-collected`,
      );
    });

    it("replaces the URL with a sticker selection, preserving the other filters", () => {
      withParams({ "filters[location]": "Банско", "filters[stamp]": "collected" });
      const { result } = renderHook(() => useSiteFilters());

      result.current.setStickerFilter("not-available");

      expect(replaceMock).toHaveBeenCalledWith(
        `?filters[location]=${encodeURIComponent("Банско")}&filters[stamp]=collected&filters[sticker]=not-available`,
      );
    });

    it("falls back to the default for an unrecognised sticker value", () => {
      withParams({ "filters[sticker]": "nonsense" });
      const { result } = renderHook(() => useSiteFilters());

      expect(result.current.stickerFilter).toBe("all");
      expect(siteNames(result.current.filteredData)).toHaveLength(5);
    });

    it("normalises an unsupported sticker value instead of writing it to the URL", () => {
      const { result } = renderHook(() => useSiteFilters());

      result.current.setStickerFilter("nonsense");

      expect(replaceMock).toHaveBeenCalledWith(
        "?filters[location]=all&filters[stamp]=all&filters[sticker]=all",
      );
    });

    it("replaces the URL with a stamp selection, preserving the other filters", () => {
      withParams({ "filters[sticker]": "collected" });
      const { result } = renderHook(() => useSiteFilters());

      result.current.setStampFilter("collected");

      expect(replaceMock).toHaveBeenCalledWith(
        "?filters[location]=all&filters[stamp]=collected&filters[sticker]=collected",
      );
    });

    it("does not touch history on mount", () => {
      withParams({ "filters[stamp]": "collected" });
      renderHook(() => useSiteFilters());

      expect(replaceMock).not.toHaveBeenCalled();
    });

    it("reflects updated URL params on re-render (back/forward navigation)", () => {
      const { result, rerender } = renderHook(() => useSiteFilters());

      expect(result.current.selectedLocation).toBe("all");
      expect(result.current.stampFilter).toBe("all");
      expect(result.current.stickerFilter).toBe("all");

      withParams({
        "filters[location]": "Банско",
        "filters[stamp]": "collected",
        "filters[sticker]": "not-collected",
      });
      rerender();

      expect(result.current.selectedLocation).toBe("Банско");
      expect(result.current.stampFilter).toBe("collected");
      expect(result.current.stickerFilter).toBe("not-collected");
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
