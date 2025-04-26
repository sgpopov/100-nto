"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteList } from "@/components/SiteList";
import { SelectFilter } from "@/components/SelectFilter";
import { randomId } from "@/utils";

import data from "./data.json";

export default function Main() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filter values from URL query params or default to "all"
  const initialLocation = searchParams.get("filters[location]") || "all";
  const initialVisitedFilter = searchParams.get("filters[visited]") || "all";

  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
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
    const options = [] as { id: string; value: string; text: string }[];

    citiesByRegion.forEach((region) => {
      // Add the region as an option
      options.push({
        id: region.id,
        value: region.value,
        text: region.text,
      });

      // Add all cities in this region
      region.cities.forEach((city) => {
        options.push({
          id: city.id,
          value: city.value,
          text: `- ${city.text}`,
        });
      });
    });

    return options;
  }, [citiesByRegion]);

  const visitedFilters = [
    { id: "visited", value: "visited", text: "Посетени" },
    { id: "not-visited", value: "not-visited", text: "Непосетени" },
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

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };

  const handleVisitedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVisitedFilter(e.target.value);
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
      <div className="rounded-md bg-white px-6 py-4 shadow-sm">
        <div className="flex gap-x-5">
          <div>
            <SelectFilter
              id="location"
              label="Град"
              defaultValue={selectedLocation}
              options={cityOptions}
              onChange={handleCityChange}
            />
          </div>

          <div>
            <SelectFilter
              id="visited"
              label="Посетени"
              defaultValue={visitedFilter}
              options={visitedFilters}
              onChange={handleVisitedChange}
            />
          </div>
        </div>
      </div>

      {filteredData.length > 0 && (
        <>
          <div className="w-full flex justify-end py-5 text-sm italic">
            показване на {results.filtered} резултата от общо {results.total}
          </div>
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
