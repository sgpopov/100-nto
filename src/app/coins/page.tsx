"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CoinsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/coins/list");
  }, [router]);

  return null;
}
