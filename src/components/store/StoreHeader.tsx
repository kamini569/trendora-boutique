import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, Search, Sparkles, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop?category=jewellery", label: "Jewellery" },
  { to: "/shop?category=handbags", label: "Handbags" },
];

export function StoreHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const categoryParam = new URLSearchParams(location.search).get("category");

  function navIsActive(to: string) {
    if (to === "/") return location.pathname === "/";
    if (to === "/shop") {
      const onShop =
        location.pathname === "/shop" ||
        location.pathname.startsWith("/product");
      return onShop && categoryParam !== "jewellery" && categoryParam !== "handbags";
    }
    if (to.startsWith("/shop?category=")) {
      const target = new URLSearchParams(to.split("?")[1]).get("category");
      return location.pathname === "/shop" && categoryParam === target;
    }
    return location.pathname === to;
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  }

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-ink text-[#f8efe5]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] sm:text-[11px]">
          <Sparkles className="size-3 shrink-0 text-marigold" />
          <span>The launch edit is live</span>
          <span className="hidden text-white/35 sm:inline">·</span>
          <span className="hidden text-white/70 sm:inline">
            Complimentary delivery over $150
          </span>
        </div>
      </div>

      <header className="border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-ml-2 rounded-full md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background px-2">
                <SheetHeader className="px-4 pt-4">
                  <SheetTitle className="font-display text-2xl tracking-tight">
                    Trendora
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col px-2">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="border-b border-border/60 py-3.5 font-display text-lg text-ink transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <p className="eyebrow mt-6 px-4">Shop by category</p>
                <div className="mt-3 grid grid-cols-2 gap-2 px-3">
                  {CATEGORIES.map((category) => (
                    <Link
                      key={category.slug}
                      to={`/shop?category=${category.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl bg-card px-3 py-2.5 text-[13px] font-medium text-foreground/80 shadow-sm transition-colors hover:text-primary"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-6 px-3">
                  <Button
                    className="w-full rounded-full"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/admin");
                    }}
                  >
                    <UserRound className="size-4" />
                    Owner studio
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="group flex items-baseline gap-2">
              <span className="font-display text-[1.65rem] font-semibold leading-none tracking-[-0.045em] text-ink">
                Trendora
              </span>
              <span className="hidden text-[9px] font-medium uppercase tracking-[0.22em] text-primary/70 sm:inline">
                boutique
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => {
              const active = navIsActive(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={cn(
                    "relative py-1 text-[13px] font-medium text-foreground/70 transition-colors hover:text-primary",
                    "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                    active && "text-primary after:w-full",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <form
              onSubmit={submitSearch}
              className="relative hidden items-center lg:flex"
            >
              <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search the edit"
                aria-label="Search products"
                className="h-9 w-44 rounded-full border border-border bg-card pl-8 pr-3 text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/80 focus:w-56 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </form>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full lg:hidden"
              aria-label="Search"
            >
              <Link to="/shop">
                <Search className="size-[18px]" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="hidden h-9 rounded-full border-border bg-transparent px-4 text-[11px] font-semibold uppercase tracking-[0.12em] hover:border-primary/40 hover:bg-blush/60 sm:inline-flex"
            >
              <Link to="/admin">
                <UserRound className="size-3.5" />
                Owner studio
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full sm:hidden"
              aria-label="Owner studio"
            >
              <Link to="/admin">
                <UserRound className="size-[18px]" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}

export function StoreFooter() {
  return (
    <footer className="mt-20 bg-ink text-[#f4e9de]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <p className="font-display text-3xl font-semibold tracking-[-0.04em]">
              Trendora
            </p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#f4e9de]/65">
              A considered online boutique for the pieces you reach for again
              and again. Small edits, natural fibres, made to be kept.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#f4e9de]/70">
              <span className="size-1.5 rounded-full bg-marigold" />
              Launch edit · 2026
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f4e9de]/45">
              Shop
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    to={`/shop?category=${category.slug}`}
                    className="text-[#f4e9de]/75 transition-colors hover:text-marigold"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f4e9de]/45">
              The studio
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-[#f4e9de]/75 transition-colors hover:text-marigold"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="text-[#f4e9de]/75 transition-colors hover:text-marigold"
                >
                  The full edit
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="text-[#f4e9de]/75 transition-colors hover:text-marigold"
                >
                  Owner studio
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@trendora.studio"
                  className="text-[#f4e9de]/75 transition-colors hover:text-marigold"
                >
                  hello@trendora.studio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f4e9de]/45">
              Studio hours
            </p>
            <p className="mt-4 text-sm leading-6 text-[#f4e9de]/75">
              Monday – Friday
              <br />
              10am – 5pm
            </p>
            <p className="mt-3 text-sm leading-6 text-[#f4e9de]/55">
              Complimentary delivery on orders over $150. Pieces are packed by
              hand in recycled tissue.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-marigold transition-colors hover:text-[#f8e8c8]"
            >
              Shop the edit
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11px] text-[#f4e9de]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trendora Boutique. All rights reserved.</p>
          <p>Considered pieces, thoughtfully made.</p>
        </div>
      </div>
    </footer>
  );
}
