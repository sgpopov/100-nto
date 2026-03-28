"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { randomId } from "@/utils";
import data from "@/data/places.json";
import Filter from "@/components/Filter";
import ViewToggle from "@/components/ViewToggle";
import { useSiteFilters } from "@/hooks/useSiteFilters";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function SitesMapPage() {
  const {
    selectedLocation,
    setSelectedLocation,
    visitedFilter,
    setVisitedFilter,
    cityOptions,
    visitedFilters,
    filteredData,
    queryString,
  } = useSiteFilters();

  const results = {
    total: data.reduce((acc, city) => acc + city.sites.length, 0),
    filtered: filteredData.reduce((acc, city) => acc + city.sites.length, 0),
  };

  const pins = useMemo(
    () =>
      filteredData.flatMap((city) =>
        city.sites.map((site) => ({
          key: `${city.city}-${site.name}-${randomId()}`,
          lat: site.lat,
          lng: site.lng,
          active: site.visited,
          popup: (
            <div>
              <div className="font-semibold">{site.name}</div>
              <div className="text-gray-500 text-xs">{city.city} &bull; №{site.number}</div>
            </div>
          ),
        }))
      ),
    [filteredData]
  );

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-x-5">
            <Filter
              name="Град"
              selectedValue={selectedLocation}
              options={cityOptions}
              onFilterChanged={setSelectedLocation}
            />

            <Filter
              name="Посетени"
              selectedValue={visitedFilter}
              options={visitedFilters}
              onFilterChanged={setVisitedFilter}
            />
          </div>

          <div className="flex items-center gap-x-5 pt-5 md:pt-0">
            <div className="text-sm italic">
              показване на {results.filtered} резултата от общо {results.total}
            </div>

            <ViewToggle
              currentView="map"
              listHref={`/?${queryString}`}
              mapHref={`/sites/map?${queryString}`}
            />
          </div>
        </div>
      </section>

      <MapView pins={pins} />
    </>
  );
}
