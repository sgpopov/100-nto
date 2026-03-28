"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { randomId } from "@/utils";
import data from "@/data/places.json";

export function useSiteFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialLocation = searchParams.get("filters[location]") || "all";
  const initialVisitedFilter = searchParams.get("filters[visited]") || "all";

  const [selectedLocation, setSelectedLocation] =
    useState<string>(initialLocation);

  const [visitedFilter, setVisitedFilter] =
    useState<string>(initialVisitedFilter);

  const citiesByRegion = useMemo(() => {
    const regions = [...new Set(data.map((city) => city.region))].sort();

    return regions.map((region) => {
      const citiesInRegion = data
        .filter((city) => city.region === region)
        .map((city) => city.city)
        .sort();

      return {
        id: `region-${region}-${randomId()}`,
        value: region,
        text: region,
        cities: citiesInRegion.map((cityName) => ({
          id: `${cityName}-${randomId()}`,
          value: cityName,
          text: cityName,
        })),
      };
    });
  }, []);

  const cityOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [
      { value: "all", label: "Всички" },
    ];

    citiesByRegion.forEach((region) => {
      options.push({ value: region.value, label: region.text });
      region.cities.forEach((city) => {
        options.push({ value: city.value, label: `- ${city.text}` });
      });
    });

    return options;
  }, [citiesByRegion]);

  const visitedFilters = [
    { value: "all", label: "Всички" },
    { value: "visited", label: "Посетени" },
    { value: "not-visited", label: "Непосетени" },
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
          sites: city.sites.filter((site) => {
            if (visitedFilter === "visited") return site.visited === true;
            if (visitedFilter === "not-visited") return !site.visited;
            return true;
          }),
        }))
        .filter((city) => city.sites.length > 0),
    [selectedLocation, visitedFilter]
  );

  const queryString = `filters[location]=${encodeURIComponent(selectedLocation)}&filters[visited]=${encodeURIComponent(visitedFilter)}`;

  useEffect(() => {
    router.push(`?${queryString}`);
  }, [queryString, router]);

  return {
    selectedLocation,
    setSelectedLocation,
    visitedFilter,
    setVisitedFilter,
    cityOptions,
    visitedFilters,
    filteredData,
    queryString,
  };
}
