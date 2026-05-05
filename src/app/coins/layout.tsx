"use client";

import { usePathname } from "next/navigation";
import coins from "@/data/coins.json";
import Filter from "@/components/Filter";
import ViewToggle from "@/components/ViewToggle";
import { useCoinsFilters } from "@/hooks/useCoinsFilters";
import { CoinsProvider } from "./context";

export default function CoinsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const filters = useCoinsFilters();
  const {
    selectedLocation,
    setSelectedLocation,
    collectedFilter,
    setCollectedFilter,
    locationOptions,
    collectedFilters,
    filteredData,
    queryString,
  } = filters;

  const currentView = pathname.startsWith("/coins/map") ? "map" : "list";

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-x-5">
            <Filter
              name="Локация"
              selectedValue={selectedLocation}
              options={locationOptions}
              onFilterChanged={setSelectedLocation}
            />

            <Filter
              name="Събрани"
              selectedValue={collectedFilter}
              options={collectedFilters}
              onFilterChanged={setCollectedFilter}
            />
          </div>

          <div className="flex items-center gap-x-5 pt-5 md:pt-0">
            <div className="text-sm italic">
              {filteredData.length} резултата от общо {coins.length}
            </div>

            <ViewToggle
              currentView={currentView}
              listHref={`/coins/list?${queryString}`}
              mapHref={`/coins/map?${queryString}`}
            />
          </div>
        </div>
      </section>

      <CoinsProvider value={filters}>{children}</CoinsProvider>
    </>
  );
}
