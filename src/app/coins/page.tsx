import React from "react";

import { CheckBadgeIcon } from "@heroicons/react/16/solid";
import coins from "@/data/coins.json";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Сувенирни монети",
};

export default function Main() {
  const results = {
    total: coins.length,
    collected: coins.filter((coin) => coin.collected).length,
  };

  return (
    <>
      {coins.length > 0 && (
        <>
          <div className="w-full flex justify-end py-5 text-sm italic">
            събрани {results.collected} резултата от общо {results.total}
          </div>

          <ul
            role="list"
            className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4"
          >
            {coins.map((coin) => (
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
