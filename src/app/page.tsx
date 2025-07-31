"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteList } from "@/components/SiteList";
import { randomId } from "@/utils";
import data from "./data.json";
import Filter from "@/components/Filter";

export default function Main() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filter values from URL query params or default to "all"
  const initialLocation = searchParams.get("filters[location]") || "all";
  const initialVisitedFilter = searchParams.get("filters[visited]") || "all";

  const [selectedLocation, setSelectedLocation] =
    useState<string>(initialLocation);

  const [visitedFilter, setVisitedFilter] =
    useState<string>(initialVisitedFilter);

  const citiesByRegion = useMemo(() => {
    const regions = [...new Set(data.map((city) => city.region))].sort();

    const result = regions.map((region) => {
      // Get all cities in this region
      const citiesInRegion = data
        .filter((city) => city.region === region)
        .map((city) => city.city)
        .sort(); // Sort cities alphabetically

      // Create an array of options for each region
      return {
        id: `region-${region}-${randomId()}`,
        value: region,
        text: region,
        cities: citiesInRegion.map((cityName) => {
          return {
            id: `${cityName}-${randomId()}`,
            value: cityName,
            text: cityName,
          };
        }),
      };
    });

    return result;
  }, []);

  // Flatten cities for the dropdown
  const cityOptions = useMemo(() => {
    const options = [
      {
        value: "all",
        label: "Всички",
      },
    ];

    citiesByRegion.forEach((region) => {
      // Add the region as an option
      options.push({
        value: region.value,
        label: region.text,
      });

      // Add all cities in this region
      region.cities.forEach((city) => {
        options.push({
          value: city.value,
          label: `- ${city.text}`,
        });
      });
    });

    return options;
  }, [citiesByRegion]);

  const visitedFilters = [
    { value: "all", label: "Всички" },
    { value: "visited", label: "Посетени" },
    { value: "not-visited", label: "Непосетени" },
  ];

  const filteredData = data
    .filter(
      (city) =>
        selectedLocation === "all" ||
        city.city === selectedLocation ||
        city.region === selectedLocation
    )
    .map((city) => {
      return {
        ...city,
        sites: city.sites.filter((site) => {
          if (visitedFilter === "visited") {
            return site.visited === true;
          }

          if (visitedFilter === "not-visited") {
            return !site.visited;
          }

          return true;
        }),
      };
    })
    .filter((city) => city.sites.length > 0);

  const onCityChange = (value: string) => {
    setSelectedLocation(value);
  };

  const onVisitedFilterChange = (value: string) => {
    setVisitedFilter(value);
  };

  const results = {
    total: data.reduce((acc, city) => acc + city.sites.length, 0),
    filtered: filteredData.reduce((acc, city) => acc + city.sites.length, 0),
  };

  useEffect(() => {
    const queryParts = [
      `filters[location]=${encodeURIComponent(selectedLocation)}`,
      `filters[visited]=${encodeURIComponent(visitedFilter)}`,
    ];

    router.push(`?${queryParts.join("&")}`);
  }, [selectedLocation, visitedFilter, router]);

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto  py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-x-5">
            <Filter
              name="Град"
              selectedValue={selectedLocation}
              options={cityOptions}
              onFilterChanged={onCityChange}
            />

            <Filter
              name="Посетени"
              selectedValue={visitedFilter}
              options={visitedFilters}
              onFilterChanged={onVisitedFilterChange}
            />
          </div>

          <div className="text-sm italic pt-5 md:pt-0">
            показване на {results.filtered} резултата от общо {results.total}
          </div>
        </div>
      </section>

      {filteredData.length > 0 && (
        <>
          <ul role="list" className="space-y-3">
            {filteredData.map((city) => (
              <li
                key={city.city}
                className="overflow-hidden rounded-md bg-white px-6 py-4 shadow-sm"
              >
                <h3 className="text-base font-semibold text-gray-900">
                  {city.city} ({city.sites.length})
                </h3>

                <div className="py-5">
                  <SiteList siteList={city.sites} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {!filteredData.length && (
        <p className="mt-10 text-center">Няма намерени резултати</p>
      )}
    </>
  );
}
