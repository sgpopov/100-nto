"use client";

import { createContext, useContext } from "react";
import type { useSiteFilters } from "@/hooks/useSiteFilters";

type SitesContextValue = ReturnType<typeof useSiteFilters>;

const SitesContext = createContext<SitesContextValue | null>(null);

export function SitesProvider({
  value,
  children,
}: {
  value: SitesContextValue;
  children: React.ReactNode;
}) {
  return (
    <SitesContext.Provider value={value}>{children}</SitesContext.Provider>
  );
}

export function useSitesContext() {
  const ctx = useContext(SitesContext);
  if (!ctx) throw new Error("useSitesContext must be used within SitesProvider");
  return ctx;
}
