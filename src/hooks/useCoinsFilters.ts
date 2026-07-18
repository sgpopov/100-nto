"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import coins from "@/data/coins.json";
import { matchesCoinFilter, toCoinFilterValue } from "@/lib/coinStatus";

export function useCoinsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedLocation = searchParams.get("filters[location]") || "all";
  // Links bookmarked with the old yes/no values fall back to "all" rather than
  // being aliased; mixing them with not-available would be an incoherent set.
  const collectedFilter = toCoinFilterValue(
    searchParams.get("filters[collected]"),
  );

  const setSelectedLocation = (value: string) => {
    router.replace(
      `?filters[location]=${encodeURIComponent(value)}&filters[collected]=${encodeURIComponent(collectedFilter)}`,
    );
  };

  const setCollectedFilter = (value: string) => {
    router.replace(
      `?filters[location]=${encodeURIComponent(selectedLocation)}&filters[collected]=${encodeURIComponent(value)}`,
    );
  };

  const hasActiveFilters =
    selectedLocation !== "all" || collectedFilter !== "all";

  const clearFilters = () => {
    router.replace("?filters[location]=all&filters[collected]=all");
  };

  const locationsByProvince = useMemo(() => {
    const provinces = [...new Set(coins.map((coin) => coin.province))].sort();

    return provinces.map((province) => {
      const citiesInProvince = [
        ...new Set(
          coins
            .filter((coin) => coin.province === province)
            .map((coin) => coin.location)
            .sort(),
        ),
      ];

      return {
        value: province,
        label: province,
        cities: citiesInProvince.map((cityName) => ({
          value: cityName,
          label: cityName,
        })),
      };
    });
  }, []);

  const collectedFilters = [
    { value: "all", label: "Всички" },
    { value: "collected", label: "Да" },
    { value: "not-collected", label: "Не" },
    { value: "not-available", label: "Не се предлага" },
  ];

  const filteredData = useMemo(
    () =>
      coins.filter((coin) => {
        const passesLocation =
          selectedLocation === "all" ||
          coin.province === selectedLocation ||
          coin.location === selectedLocation;

        return passesLocation && matchesCoinFilter(coin, collectedFilter);
      }),
    [selectedLocation, collectedFilter],
  );

  const queryString = `filters[location]=${encodeURIComponent(selectedLocation)}&filters[collected]=${encodeURIComponent(collectedFilter)}`;

  return {
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
  };
}
