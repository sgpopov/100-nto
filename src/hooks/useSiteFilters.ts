"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import data from "@/data/places.json";
import {
  matchesStampFilter,
  toStampFilterValue,
  type StampFilterValue,
} from "@/lib/collectionStatus";

export function useSiteFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialLocation = searchParams.get("filters[location]") || "all";
  // A stale link carrying the removed visited parameter simply falls back to
  // the default selection; no alias is provided.
  const initialStampFilter = toStampFilterValue(
    searchParams.get("filters[stamp]")
  );

  const [selectedLocation, setSelectedLocation] =
    useState<string>(initialLocation);

  const [stampFilter, setStampFilterValue] =
    useState<StampFilterValue>(initialStampFilter);

  // The filter widget deals in plain strings; narrowing happens here so
  // callers stay pure wiring.
  const setStampFilter = (value: string) => {
    setStampFilterValue(toStampFilterValue(value));
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
          sites: city.sites.filter((site) =>
            matchesStampFilter(site, stampFilter)
          ),
        }))
        .filter((city) => city.sites.length > 0),
    [selectedLocation, stampFilter]
  );

  const queryString = `filters[location]=${encodeURIComponent(selectedLocation)}&filters[stamp]=${encodeURIComponent(stampFilter)}`;

  useEffect(() => {
    router.push(`?${queryString}`);
  }, [queryString, router]);

  return {
    selectedLocation,
    setSelectedLocation,
    stampFilter,
    setStampFilter,
    citiesByRegion,
    stampFilters,
    filteredData,
    queryString,
  };
}
