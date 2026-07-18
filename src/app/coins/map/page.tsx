"use client";

import { useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { BadgeCheckIcon } from "lucide-react";
import { useCoinsContext } from "../context";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function CoinsMapPage() {
  const { filteredData } = useCoinsContext();

  const pins = useMemo(() => {
    const coinsWithCoords = filteredData.filter(
      (coin) => coin.coordinates[0] != null && coin.coordinates[1] != null,
    );

    // Group coins by exact coordinates so we can spread duplicates apart.
    const coordGroups = new Map<string, typeof coinsWithCoords>();

    for (const coin of coinsWithCoords) {
      const key = `${coin.coordinates[0]},${coin.coordinates[1]}`;
      const group = coordGroups.get(key) ?? [];

      group.push(coin);
      coordGroups.set(key, group);
    }

    return coinsWithCoords.map((coin) => {
      const key = `${coin.coordinates[0]},${coin.coordinates[1]}`;
      const group = coordGroups.get(key)!;
      const index = group.indexOf(coin);
      const count = group.length;

      let lat = coin.coordinates[1] as number;
      let lng = coin.coordinates[0] as number;

      if (count > 1) {
        // Spread duplicates evenly around a ~30 m circle.
        const radius = 0.0003;
        const angle = (2 * Math.PI * index) / count;

        lat += radius * Math.cos(angle);
        lng += radius * Math.sin(angle);
      }

      return {
        key: coin.id,
        lat,
        lng,
        // Coins keep their single collected flag; they have no second
        // collectible, so they are only ever nothing or complete.
        status: coin.collected ? ("complete" as const) : ("none" as const),
        popup: (
          <div>
            <Image
              src={coin.images[0].url}
              alt={`Coin image for ${coin.name}`}
              width={64}
              height={64}
              className="rounded-full mx-auto mb-2 object-cover"
            />
            <div className="font-semibold text-sm text-center">{coin.name}</div>
            {coin.collected && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <BadgeCheckIcon
                  aria-hidden="true"
                  className="w-4 h-4 text-green-700"
                />
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
      };
    });
  }, [filteredData]);

  return <MapView pins={pins} />;
}
