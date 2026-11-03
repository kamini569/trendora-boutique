import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect } from "react";

let seedRequested = false;

/**
 * New stores start empty. This quietly publishes the sample launch edit the
 * first time a storefront page loads; the mutation is a no-op once any product
 * exists, so owner edits are never overwritten.
 */
export function useCatalogueSeed() {
  const ensureSeeded = useMutation(api.products.ensureSeeded);

  useEffect(() => {
    if (seedRequested) return;
    seedRequested = true;
    ensureSeeded().catch((error) => {
      seedRequested = false;
      console.error("Could not seed the Trendora catalogue:", error);
    });
  }, [ensureSeeded]);
}
