"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationLinks = {
  href: string;
  title: string;
};

export default function Navigation({ links }: { links: NavigationLinks[] }) {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 justify-between">
          <div className="flex flex-1 items-stretch justify-start">
            <div className="flex space-x-8">
              {links.map((link) => {
                const root = `/${link.href.split("/")[1]}`;

                const isActive =
                  pathname === link.href || pathname.startsWith(`${root}/`);

                return (
                  <Link
                    key={link.title}
                    href={link.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {link.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
