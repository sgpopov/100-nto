"use client";

import React, { useEffect, useState } from "react";

import { CheckBadgeIcon } from "@heroicons/react/16/solid";
import coins from "@/data/coins.json";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Filter from "@/components/Filter";

export default function CoinsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filter values from URL query params or default to "all"
  const initialCollectedFilter =
    searchParams.get("filters[collected]") || "all";

  const [collectedFilter, setCollectedFilter] = useState<string>(
    initialCollectedFilter
  );

  const collectedFilters = [
    { value: "all", label: "Всички" },
    { value: "yes", label: "Да" },
    { value: "no", label: "Не" },
  ];

  const onCollectedFilterChange = (value: string) => {
    setCollectedFilter(value);
  };

  const filteredData = coins.filter((coin) => {
    if (collectedFilter === "all") {
      return true;
    }

    if (collectedFilter === "yes") {
      return coin.collected === true;
    }

    return coin.collected === false;
  });

  useEffect(() => {
    const queryParts = [
      `filters[collected]=${encodeURIComponent(collectedFilter)}`,
    ];

    router.replace(`coins?${queryParts.join("&")}`);
  }, [collectedFilter, router]);

  return (
    <>
      <section aria-labelledby="filter-heading" className="mx-auto  py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-x-5">
            <Filter
              name="Събрани"
              selectedValue={collectedFilter}
              options={collectedFilters}
              onFilterChanged={onCollectedFilterChange}
            />
          </div>

          <div className="text-sm italic pt-5 md:pt-0">
            {filteredData.length} резултата от общо {coins.length}
          </div>
        </div>
      </section>

      {filteredData.length > 0 && (
        <>
          <ul
            role="list"
            className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {filteredData.map((coin) => (
              <li
                key={coin.id}
                className="col-span-1 flex flex-col relative divide-y divide-gray-200 rounded-lg bg-white text-center shadow-sm"
              >
                <div className="flex flex-1 flex-col p-8">
                  <a href={coin.url} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true" className="absolute inset-0" />
                    <img
                      alt={`Coin image for ${coin.name}`}
                      src={coin.images[0].url}
                      className="mx-auto size-32 shrink-0 rounded-full"
                    />
                  </a>
                  <h3 className="mt-6 text-sm font-medium text-gray-900">
                    {coin.name}
                  </h3>
                  {coin.collected && (
                    <div className="mt-3 flex flex-col items-center">
                      <CheckBadgeIcon
                        title="Събрана монета"
                        className="w-5 h-5 text-green-700"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
