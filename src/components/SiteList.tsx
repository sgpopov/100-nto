import { CheckBadgeIcon } from "@heroicons/react/16/solid";

type SiteListData = {
  name: string;
  number: string;
  image: string;
  link: string;
  visited: boolean;
};

interface SiteListProps {
  siteList: SiteListData[];
  visitedFilter?: "all" | "visited" | "not-visited";
}

export const SiteList = ({ siteList }: SiteListProps) => {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8"
    >
      {siteList.map((site) => (
        <li key={site.name} className="relative">
          <a href={site.link} target="_blank">
            <div className="relative">
              <div className="relative h-56 w-full overflow-hidden rounded-lg">
                <img src={site.image} className="size-full object-cover" />
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

                <p className="relative text-lg font-semibold text-white">
                  {site.visited && (
                    <CheckBadgeIcon title="Посетен обект" className="w-5 h-5" />
                  )}
                </p>
              </div>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};
