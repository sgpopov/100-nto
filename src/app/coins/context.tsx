"use client";

import { createContext, useContext } from "react";
import { useCoinsFilters } from "@/hooks/useCoinsFilters";

type CoinsContextValue = ReturnType<typeof useCoinsFilters>;

const CoinsContext = createContext<CoinsContextValue | null>(null);

export function CoinsProvider({
  value,
  children,
}: {
  value: CoinsContextValue;
  children: React.ReactNode;
}) {
  return (
    <CoinsContext.Provider value={value}>{children}</CoinsContext.Provider>
  );
}

export function useCoinsContext() {
  const ctx = useContext(CoinsContext);

  if (!ctx) {
    throw new Error("useCoinsContext must be used within CoinsProvider");
  }

  return ctx;
}
