"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import data from "@/data/places.json";
import {
  matchesStampFilter,
  matchesStickerFilter,
  toStampFilterValue,
  toStickerFilterValue,
  type StampFilterValue,
  type StickerFilterValue,
} from "@/lib/collectionStatus";

const buildQuery = (
  location: string,
  stamp: StampFilterValue,
  sticker: StickerFilterValue,
) =>
  `filters[location]=${encodeURIComponent(location)}&filters[stamp]=${encodeURIComponent(stamp)}&filters[sticker]=${encodeURIComponent(sticker)}`;

export function useSiteFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedLocation = searchParams.get("filters[location]") || "all";
  // A stale link carrying the removed visited parameter simply falls back to
  // the default selection; no alias is provided.
  const stampFilter = toStampFilterValue(searchParams.get("filters[stamp]"));
  const stickerFilter = toStickerFilterValue(
    searchParams.get("filters[sticker]"),
  );

  const setSelectedLocation = (value: string) => {
    router.replace(`?${buildQuery(value, stampFilter, stickerFilter)}`);
  };

  // The filter widget deals in plain strings; narrowing happens here so the URL
  // can never disagree with the filter actually applied.
  const setStampFilter = (value: string) => {
    router.replace(
      `?${buildQuery(selectedLocation, toStampFilterValue(value), stickerFilter)}`,
    );
  };

  const setStickerFilter = (value: string) => {
    router.replace(
      `?${buildQuery(selectedLocation, stampFilter, toStickerFilterValue(value))}`,
    );
  };

  const hasActiveFilters =
    selectedLocation !== "all" ||
    stampFilter !== "all" ||
    stickerFilter !== "all";

  const clearFilters = () => {
    router.replace(`?${buildQuery("all", "all", "all")}`);
  };

  const citiesByRegion = useMemo(() => {
    const regions = [...new Set(data.map((city) => city.region))].sort();

    return regions.map((region) => {
      const citiesInRegion = data
        .filter((city) => city.region === region)
        .map((city) => city.city)
        .sort();

      return {
        value: region,
        label: region,
        cities: citiesInRegion.map((cityName) => ({
          value: cityName,
          label: cityName,
        })),
      };
    });
  }, []);

  const stampFilters = [
    { value: "all", label: "Всички" },
    { value: "collected", label: "Събрани" },
    { value: "not-collected", label: "Несъбрани" },
  ];

  const stickerFilters = [
    { value: "all", label: "Всички" },
    { value: "collected", label: "Събрани" },
    { value: "not-collected", label: "Несъбрани" },
    { value: "not-available", label: "Не се предлага" },
  ];

  const filteredData = useMemo(
    () =>
      data
        .filter(
          (city) =>
            selectedLocation === "all" ||
            city.city === selectedLocation ||
            city.region === selectedLocation
        )
        .map((city) => ({
          ...city,
          sites: city.sites.filter(
            (site) =>
              matchesStampFilter(site, stampFilter) &&
              matchesStickerFilter(site, stickerFilter)
          ),
        }))
        .filter((city) => city.sites.length > 0),
    [selectedLocation, stampFilter, stickerFilter]
  );

  const queryString = buildQuery(selectedLocation, stampFilter, stickerFilter);

  return {
    selectedLocation,
    setSelectedLocation,
    stampFilter,
    setStampFilter,
    stickerFilter,
    setStickerFilter,
    citiesByRegion,
    stampFilters,
    stickerFilters,
    filteredData,
    queryString,
    hasActiveFilters,
    clearFilters,
  };
}
