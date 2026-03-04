"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ToastKey } from "@/lib/navigation/toast";
import { withToast } from "@/lib/navigation/toast";

/**
 * Appends a route-level toast query flag without forcing a full page navigation.
 */
export function useToastSignal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (toast: ToastKey) => {
      const search = searchParams.toString();
      const currentPath = search ? `${pathname}?${search}` : pathname;
      router.replace(withToast(currentPath, toast), { scroll: false });
    },
    [pathname, router, searchParams],
  );
}
