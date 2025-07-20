"use client";

import React, { useEffect, useState } from "react";

import { CheckBadgeIcon } from "@heroicons/react/16/solid";
import coins from "@/data/coins.json";
import { SelectFilter } from "@/components/SelectFilter";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Main() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial filter values from URL query params or default to "all"
  const initialCollectedFilter =
    searchParams.get("filters[collected]") || "all";

  const [collectedFilter, setCollectedFilter] = useState<string>(
    initialCollectedFilter
  );

  const collectedFilters = [
    { id: "yes", value: "yes", text: "Да" },
    { id: "no", value: "no", text: "Не" },
  ];

  const handleCollectedFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setCollectedFilter(e.target.value);
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

    router.push(`coins?${queryParts.join("&")}`);
  }, [collectedFilter, router]);

  return (
    <>
      <div className="rounded-md bg-white px-6 py-4 shadow-sm">
        <div className="flex gap-x-5">
          <div>
            <SelectFilter
              id="visited"
              label="Събрани"
              defaultValue={collectedFilter}
              options={collectedFilters}
              onChange={handleCollectedFilterChange}
            />
          </div>
        </div>
      </div>
      {coins.length > 0 && (
        <>
          <div className="w-full flex justify-end py-5 text-sm italic">
            {filteredData.length} резултата от общо {coins.length}
          </div>

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
                  <a href={coin.url} target="_blank">
                    <span aria-hidden="true" className="absolute inset-0" />
                    <img
                      alt=""
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
