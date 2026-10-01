"use client";

import { BadgeCheckIcon } from "lucide-react";
import { CoinAvailability } from "@/components/CoinAvailability";
import { CoinImage } from "@/components/CoinImage";
import { useCoinsContext } from "../context";

export default function CoinsListPage() {
  const { filteredData } = useCoinsContext();

  if (filteredData.length === 0) {
    return null;
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
    >
      {filteredData.map((coin) => (
        <li
          key={coin.id}
          className="col-span-1 flex flex-col relative divide-y divide-gray-200 rounded-lg bg-white text-center shadow-sm"
        >
          <div className="flex flex-1 flex-col p-4 md:p-8">
            {coin.url ? (
              <a href={coin.url} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true" className="absolute inset-0" />
                <CoinImage coin={coin} className="mx-auto size-20 md:size-32" />
              </a>
            ) : (
              <CoinImage coin={coin} className="mx-auto size-20 md:size-32" />
            )}
            <h3 className="mt-6 text-sm font-medium text-gray-900">
              {coin.name}
            </h3>
            {coin.collected && (
              <div className="mt-3 flex flex-col items-center">
                <BadgeCheckIcon
                  data-testid="collected-badge"
                  role="img"
                  aria-label="Събрана монета"
                  className="w-5 h-5 text-green-700"
                />
              </div>
            )}
            <CoinAvailability state={coin} className="mt-3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
