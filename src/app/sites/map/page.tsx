"use client";

import { useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { randomId } from "@/utils";
import { useSitesContext } from "../context";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function SitesMapPage() {
  const { filteredData } = useSitesContext();

  const pins = useMemo(
    () =>
      filteredData.flatMap((city) =>
        city.sites.map((site) => ({
          key: `${city.city}-${site.name}-${randomId()}`,
          lat: site.lat,
          lng: site.lng,
          active: site.visited,
          popup: (
            <div>
              <div className="relative w-full h-24 mb-2">
                <Image
                  src={site.image}
                  alt={site.name}
                  fill
                  loading="eager"
                  className="object-cover rounded"
                />
              </div>
              <a
                href={site.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline text-indigo-700"
              >
                {site.name}
              </a>
              <div className="text-gray-500 text-xs">
                {city.city} &bull; №{site.number}
              </div>
            </div>
          ),
        })),
      ),
    [filteredData],
  );

  return <MapView pins={pins} />;
}
