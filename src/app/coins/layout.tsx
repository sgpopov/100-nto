"use client";

import coins from "@/data/coins.json";
import Filter from "@/components/Filter";
import { useCoinsFilters } from "@/hooks/useCoinsFilters";
import { CoinsProvider } from "./context";

export default function CoinsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const filters = useCoinsFilters();
  const {
    selectedLocation,
    setSelectedLocation,
    collectedFilter,
    setCollectedFilter,
    locationOptions,
    collectedFilters,
    filteredData,
  } = filters;

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

          <div className="text-sm italic pt-5 md:pt-0">
            {filteredData.length} резултата от общо {coins.length}
          </div>
        </div>
      </section>

      <CoinsProvider value={filters}>{children}</CoinsProvider>
    </>
  );
}
