import { useCatalogueSeed } from "@/hooks/use-catalogue-seed";
import type { ReactNode } from "react";
import { StoreFooter, StoreHeader } from "./StoreHeader";

export function StoreShell({ children }: { children: ReactNode }) {
  useCatalogueSeed();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
