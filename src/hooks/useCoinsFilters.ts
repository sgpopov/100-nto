"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import coins from "@/data/coins.json";

export function useCoinsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedLocation = searchParams.get("filters[location]") || "all";
  const collectedFilter = searchParams.get("filters[collected]") || "all";

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
    { value: "yes", label: "Да" },
    { value: "no", label: "Не" },
  ];

  const filteredData = useMemo(
    () =>
      coins.filter((coin) => {
        const passesLocation =
          selectedLocation === "all" ||
          coin.province === selectedLocation ||
          coin.location === selectedLocation;

        let passesCollected = true;

        if (collectedFilter === "yes") {
          passesCollected = coin.collected === true;
        } else if (collectedFilter === "no") {
          passesCollected = coin.collected === false;
        }

        return passesLocation && passesCollected;
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
  };
}
