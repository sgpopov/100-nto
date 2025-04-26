"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteList } from "@/components/SiteList";
import { SelectFilter } from "@/components/SelectFilter";
import { randomId } from "@/utils";

import data from "./data.json";

export default function Main() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filter values from URL query params or default to "all"
  const initialCity = searchParams.get("filters[location]") || "all";
  const initialVisitedFilter = searchParams.get("filters[visited]") || "all";

  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [visitedFilter, setVisitedFilter] =
    useState<string>(initialVisitedFilter);

  const cities = data.map((city) => {
    return {
      id: `${city.city}-${randomId()}`,
      value: city.city,
      text: city.city,
    };
  });

  const visitedFilters = [
    { id: "visited", value: "visited", text: "Посетени" },
    { id: "not-visited", value: "not-visited", text: "Непосетени" },
  ];

  const filteredData = data
    .filter((city) => selectedCity === "all" || city.city === selectedCity)
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
    setSelectedCity(e.target.value);
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
      `filters[location]=${encodeURIComponent(selectedCity)}`,
      `filters[visited]=${encodeURIComponent(visitedFilter)}`,
    ];

    router.push(`?${queryParts.join("&")}`);
  }, [selectedCity, visitedFilter, router]);

  return (
    <>
      <div className="rounded-md bg-white px-6 py-4 shadow-sm">
        <div className="flex gap-x-5">
          <div>
            <SelectFilter
              id="location"
              label="Град"
              defaultValue={selectedCity}
              options={cities}
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
