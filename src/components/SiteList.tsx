import Image from "next/image";

import { CollectionIcons } from "@/components/CollectionIcons";
import type { StickerState } from "@/lib/collectionStatus";

type SiteListData = {
  name: string;
  number: string;
  image: string;
  link: string;
  stamp: boolean;
  sticker: StickerState;
};

interface SiteListProps {
  siteList: SiteListData[];
}

export const SiteList = ({ siteList }: SiteListProps) => {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
    >
      {siteList.map((site) => (
        <li key={site.name} className="relative">
          <a href={site.link} target="_blank" rel="noopener noreferrer">
            <div className="relative">
              <div className="relative h-56 w-full overflow-hidden rounded-lg">
                <Image
                  alt={`Image for ${site.name}`}
                  src={site.image}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative mt-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {site.name}
                </h3>
              </div>

              <div className="absolute inset-x-0 top-0 flex h-56 items-end justify-between overflow-hidden rounded-lg p-4">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                  номер {site.number}
                </span>

                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black opacity-20"
                />

                <CollectionIcons
                  state={site}
                  // The photographs run from near-black to near-white, so
                  // legibility comes from the shadow, not from the fill colour.
                  className="relative flex items-center gap-1.5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};
