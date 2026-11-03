import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <StoreShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <p className="font-display text-[7rem] font-semibold leading-none tracking-[-0.06em] text-primary/15 sm:text-[9rem]">
          404
        </p>
        <p className="eyebrow mt-2">Off the rail</p>
        <h1 className="display-tight mt-3 text-4xl font-semibold text-ink sm:text-5xl">
          This page isn't in the edit.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
          The link may be older than the collection. The boutique is still open
          — start again with the full rail.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button asChild className="h-11 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.12em]">
            <Link to="/shop">
              Shop the edit
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-border px-6 text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            <Link to="/">Back home</Link>
          </Button>
        </div>
      </div>
    </StoreShell>
  );
}
