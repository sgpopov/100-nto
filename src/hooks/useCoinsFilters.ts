"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { randomId } from "@/utils";
import coins from "@/data/coins.json";

export function useCoinsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialLocation = searchParams.get("filters[location]") || "all";
  const initialCollected = searchParams.get("filters[collected]") || "all";

  const [selectedLocation, setSelectedLocation] =
    useState<string>(initialLocation);

  const [collectedFilter, setCollectedFilter] =
    useState<string>(initialCollected);

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

  const locationOptions = useMemo(() => {
    const options: { key: string; value: string; label: string }[] = [
      {
        key: randomId(),
        value: "all",
        label: "Всички",
      },
    ];

    locationsByProvince.forEach((province) => {
      options.push({
        key: `${randomId()}-${province.value}`,
        value: province.value,
        label: province.label,
      });

      province.cities.forEach((city) => {
        options.push({
          key: `${randomId()}-${province.value}-${city.value}`,
          value: city.value,
          label: `- ${city.label}`,
        });
      });
    });

    return options;
  }, [locationsByProvince]);

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

  useEffect(() => {
    router.push(`?${queryString}`);
  }, [queryString, router]);

  return {
    selectedLocation,
    setSelectedLocation,
    collectedFilter,
    setCollectedFilter,
    locationOptions,
    collectedFilters,
    filteredData,
    queryString,
  };
}
