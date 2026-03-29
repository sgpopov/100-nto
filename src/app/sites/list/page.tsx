"use client";

import { SiteList } from "@/components/SiteList";
import { useSitesContext } from "../context";

export default function SitesListPage() {
  const { filteredData } = useSitesContext();

  return (
    <>
      {filteredData.length > 0 && (
        <ul role="list" className="space-y-3">
          {filteredData.map((city) => (
            <li
              key={city.city}
              className="overflow-hidden rounded-md bg-white px-6 py-4 shadow-sm"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {city.city} ({city.sites.length})
              </h3>

              <div className="py-5">
                <SiteList siteList={city.sites} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {!filteredData.length && (
        <p className="mt-10 text-center">Няма намерени резултати</p>
      )}
    </>
  );
}
