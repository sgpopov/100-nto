"use client";

import { useMemo } from "react";
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
              <img
                src={site.image}
                alt={site.name}
                className="w-full h-24 object-cover rounded mb-2"
              />
              <a
                href={site.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline text-indigo-700"
              >
                {site.name}
              </a>
              <div className="text-gray-500 text-xs">{city.city} &bull; №{site.number}</div>
            </div>
          ),
        }))
      ),
    [filteredData]
  );

  return <MapView pins={pins} />;
}
