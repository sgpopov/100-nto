"use client";

import { usePathname } from "next/navigation";
import { BadgeCheckIcon, MapPinIcon, StickerIcon } from "lucide-react";
import data from "@/data/places.json";
import Filter from "@/components/Filter";
import { FilterSummary } from "@/components/FilterSummary";
import LocationCombobox from "@/components/LocationCombobox";
import ViewToggle from "@/components/ViewToggle";
import { useSiteFilters } from "@/hooks/useSiteFilters";
import { SitesProvider } from "./context";

const filterIcon = "size-4 shrink-0 text-gray-400";

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
    hasActiveFilters,
    clearFilters,
  } = filters;

  const shown = filteredData.reduce((acc, city) => acc + city.sites.length, 0);
  const total = data.reduce((acc, city) => acc + city.sites.length, 0);

  const currentView = pathname.startsWith("/sites/map") ? "map" : "list";

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto py-6">
        <div className="flex flex-col gap-y-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
            <LocationCombobox
              name="Град"
              selectedValue={selectedLocation}
              groups={citiesByRegion}
              onFilterChanged={setSelectedLocation}
              icon={<MapPinIcon className={filterIcon} />}
            />

            <Filter
              name="Печат"
              selectedValue={stampFilter}
              options={stampFilters}
              onFilterChanged={setStampFilter}
              icon={<BadgeCheckIcon className={filterIcon} />}
            />

            <Filter
              name="Марка"
              selectedValue={stickerFilter}
              options={stickerFilters}
              onFilterChanged={setStickerFilter}
              icon={<StickerIcon className={filterIcon} />}
            />
          </div>

          <div className="flex items-center justify-end gap-x-4">
            <FilterSummary
              shown={shown}
              total={total}
              onClear={hasActiveFilters ? clearFilters : undefined}
            />

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
