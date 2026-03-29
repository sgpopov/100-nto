"use client";

import { usePathname } from "next/navigation";
import data from "@/data/places.json";
import Filter from "@/components/Filter";
import ViewToggle from "@/components/ViewToggle";
import { useSiteFilters } from "@/hooks/useSiteFilters";
import { SitesProvider } from "./context";

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const filters = useSiteFilters();
  const {
    selectedLocation,
    setSelectedLocation,
    visitedFilter,
    setVisitedFilter,
    cityOptions,
    visitedFilters,
    filteredData,
    queryString,
  } = filters;

  const results = {
    total: data.reduce((acc, city) => acc + city.sites.length, 0),
    filtered: filteredData.reduce((acc, city) => acc + city.sites.length, 0),
  };

  const currentView = pathname.startsWith("/sites/map") ? "map" : "list";

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
            <div className="flex-1 text-sm italic">
              <span className="md:hidden">{results.filtered} от {results.total}</span>
              <span className="hidden md:inline">показване на {results.filtered} {results.filtered === 1 ? "резултат" : "резултата"} от общо {results.total}</span>
            </div>

            <ViewToggle
              currentView={currentView}
              listHref={`/sites/list?${queryString}`}
              mapHref={`/sites/map?${queryString}`}
            />
          </div>
        </div>
      </section>

      <SitesProvider value={filters}>{children}</SitesProvider>
    </>
  );
}
