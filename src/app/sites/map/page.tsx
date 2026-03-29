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
              <div className="font-semibold">{site.name}</div>
              <div className="text-gray-500 text-xs">{city.city} &bull; №{site.number}</div>
            </div>
          ),
        }))
      ),
    [filteredData]
  );

  return <MapView pins={pins} />;
}
