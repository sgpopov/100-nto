"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { CheckBadgeIcon } from "@heroicons/react/16/solid";
import { useCoinsContext } from "../context";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function CoinsMapPage() {
  const { filteredData } = useCoinsContext();

  const pins = useMemo(
    () =>
      filteredData
        .filter((coin) => coin.coordinates[0] != null && coin.coordinates[1] != null)
        .map((coin) => ({
        key: coin.id,
        lat: coin.coordinates[1] as number,
        lng: coin.coordinates[0] as number,
        active: coin.collected,
        popup: (
          <div>
            <img
              src={coin.images[0].url}
              alt={`Coin image for ${coin.name}`}
              className="w-16 h-16 rounded-full mx-auto mb-2"
            />
            <div className="font-semibold text-sm text-center">{coin.name}</div>
            {coin.collected && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <CheckBadgeIcon className="w-4 h-4 text-green-700" />
                <span className="text-xs text-green-700">Събрана</span>
              </div>
            )}
            <a
              href={coin.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline mt-1 block text-center"
            >
              Виж монетата
            </a>
          </div>
        ),
      })),
    [filteredData],
  );

  return <MapView pins={pins} />;
}
