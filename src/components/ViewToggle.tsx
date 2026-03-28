"use client";

import Link from "next/link";

type View = "list" | "map";

export default function ViewToggle({
  currentView,
  listHref,
  mapHref,
}: {
  currentView: View;
  listHref: string;
  mapHref: string;
}) {

  const activeClass =
    "bg-white text-gray-900 shadow-sm";
  const inactiveClass =
    "text-gray-600 hover:text-gray-900";

  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1 text-sm font-medium">
      <Link
        href={listHref}
        aria-current={currentView === "list" ? "page" : undefined}
        className={`rounded-full px-4 py-1.5 transition-all ${currentView === "list" ? activeClass : inactiveClass}`}
      >
        Списък
      </Link>
      <Link
        href={mapHref}
        aria-current={currentView === "map" ? "page" : undefined}
        className={`rounded-full px-4 py-1.5 transition-all ${currentView === "map" ? activeClass : inactiveClass}`}
      >
        Карта
      </Link>
    </div>
  );
}
