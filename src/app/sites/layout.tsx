"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import data from "@/data/places.json";
import { CollectionProgress } from "@/components/CollectionProgress";
import Filter from "@/components/Filter";
import LocationCombobox from "@/components/LocationCombobox";
import ViewToggle from "@/components/ViewToggle";
import { useSiteFilters } from "@/hooks/useSiteFilters";
import { aggregateProgress } from "@/lib/collectionStatus";
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
    stampFilter,
    setStampFilter,
    stickerFilter,
    setStickerFilter,
    citiesByRegion,
    stampFilters,
    stickerFilters,
    filteredData,
    queryString,
  } = filters;

  const results = {
    total: data.reduce((acc, city) => acc + city.sites.length, 0),
    filtered: filteredData.reduce((acc, city) => acc + city.sites.length, 0),
  };

  const progress = useMemo(
    () => aggregateProgress(data.flatMap((city) => city.sites)),
    [],
  );

  const currentView = pathname.startsWith("/sites/map") ? "map" : "list";

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <LocationCombobox
              name="Град"
              selectedValue={selectedLocation}
              groups={citiesByRegion}
              onFilterChanged={setSelectedLocation}
            />

            <Filter
              name="Печат"
              selectedValue={stampFilter}
              options={stampFilters}
              onFilterChanged={setStampFilter}
            />

            <Filter
              name="Марка"
              selectedValue={stickerFilter}
              options={stickerFilters}
              onFilterChanged={setStickerFilter}
            />
          </div>

          <div className="flex items-center gap-x-5 pt-5 md:pt-0">
            <div className="flex flex-1 flex-col gap-y-0.5 text-sm italic md:flex-row md:gap-x-4">
              <span data-testid="filter-results">
                <span className="md:hidden">{results.filtered} от {results.total}</span>
                <span className="hidden md:inline">показване на {results.filtered} {results.filtered === 1 ? "резултат" : "резултата"} от общо {results.total}</span>
              </span>

              <CollectionProgress progress={progress} />
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
