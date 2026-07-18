"use client";

import { usePathname } from "next/navigation";
import { CircleCheckIcon, MapPinIcon } from "lucide-react";
import coins from "@/data/coins.json";
import Filter from "@/components/Filter";
import { FilterSummary } from "@/components/FilterSummary";
import LocationCombobox from "@/components/LocationCombobox";
import ViewToggle from "@/components/ViewToggle";
import { useCoinsFilters } from "@/hooks/useCoinsFilters";
import { CoinsProvider } from "./context";

const filterIcon = "size-4 shrink-0 text-gray-400";

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
    locationsByProvince,
    collectedFilters,
    filteredData,
    queryString,
    hasActiveFilters,
    clearFilters,
  } = filters;

  const currentView = pathname.startsWith("/coins/map") ? "map" : "list";

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto py-6">
        <div className="flex flex-col gap-y-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            <LocationCombobox
              name="Локация"
              selectedValue={selectedLocation}
              groups={locationsByProvince}
              onFilterChanged={setSelectedLocation}
              icon={<MapPinIcon className={filterIcon} />}
            />

            <Filter
              name="Събрани"
              selectedValue={collectedFilter}
              options={collectedFilters}
              onFilterChanged={setCollectedFilter}
              icon={<CircleCheckIcon className={filterIcon} />}
            />
          </div>

          <div className="flex items-center justify-end gap-x-4">
            <FilterSummary
              shown={filteredData.length}
              total={coins.length}
              onClear={hasActiveFilters ? clearFilters : undefined}
            />

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
