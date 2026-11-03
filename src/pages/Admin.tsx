import { ProductImage } from "@/components/store/ProductImage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useCatalogueSeed } from "@/hooks/use-catalogue-seed";
import { useAuth } from "@/hooks/use-auth";
import {
  CATEGORIES,
  categoryLabel,
  formatPrice,
  type Product as ProductType,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Loader2,
  LogOut,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

type Draft = {
  name: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  badge: string;
  images: string;
  sizes: string;
  colours: string;
  description: string;
  details: string;
  featured: boolean;
  isActive: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  category: "dresses",
  price: "",
  compareAtPrice: "",
  stock: "10",
  badge: "",
  images: "",
  sizes: "XS, S, M, L",
  colours: "Ivory: #EFE7DA",
  description: "",
  details: "",
  featured: false,
  isActive: true,
};

function draftFrom(product: ProductType): Draft {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice
      ? String(product.compareAtPrice)
      : "",
    stock: String(product.stock),
    badge: product.badge ?? "",
    images: product.images.join("\n"),
    sizes: product.sizes.join(", "),
    colours: product.colours
      .map((colour) => `${colour.name}: ${colour.hex}`)
      .join(", "),
    description: product.description,
    details: product.details.join("\n"),
    featured: product.featured,
    isActive: product.isActive,
  };
}

export default function Admin() {
  useCatalogueSeed();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const access = useQuery(api.products.adminAccess);

  const [claiming, setClaiming] = useState(false);
  const claimAdmin = useMutation(api.products.claimAdmin);

  async function handleClaim() {
    setClaiming(true);
    try {
      await claimAdmin();
      toast.success("Studio access granted", {
        description: "You're now the owner of this boutique.",
      });
    } catch (error) {
      toast.error("Could not claim the studio", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setClaiming(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/auth?returnTo=%2Fadmin");
  }

  if (access === undefined) {
    return (
      <AdminFrame
        email={user?.email}
        onSignOut={handleSignOut}
        showSignOut={Boolean(user)}
      >
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AdminFrame>
    );
  }

  if (!access.isAdmin) {
    return (
      <AdminFrame
        email={access.email}
        onSignOut={handleSignOut}
        showSignOut={access.signedIn}
      >
        <div className="mx-auto max-w-lg py-12">
          <div className="soft-card p-8 text-center sm:p-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-blush text-primary">
              <ShieldCheck className="size-6" strokeWidth={1.6} />
            </div>
            <p className="eyebrow mt-6">Owner studio</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-ink">
              {access.canClaim
                ? "Claim this boutique"
                : access.hasAdmin
                  ? "This studio has an owner"
                  : "Verify your email first"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {access.canClaim
                ? `You're signed in as ${access.email}. As the first owner, you can claim the studio and manage every product and inventory level.`
                : access.hasAdmin
                  ? "This store is already managed by another owner. Ask them to sign you in, or head back to the shopfront."
                  : "Guest sessions can browse the boutique but can't claim the owner studio. Sign in with an email address to continue."}
            </p>

            {access.canClaim ? (
              <Button
                onClick={handleClaim}
                disabled={claiming}
                className="mt-7 h-11 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.14em]"
              >
                {claiming ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Claim owner studio
              </Button>
            ) : (
              <Button
                asChild
                className="mt-7 h-11 rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.14em]"
              >
                <Link to="/shop">Back to the boutique</Link>
              </Button>
            )}

            <p className="mt-5 text-[11px] text-muted-foreground">
              {access.hasAdmin
                ? "Signed in to the wrong account?"
                : "Owner access is tied to the email on this account."}{" "}
              <button
                type="button"
                onClick={handleSignOut}
                className="font-medium text-primary underline decoration-primary/30 underline-offset-4"
              >
                Sign out
              </button>
            </p>
          </div>
        </div>
      </AdminFrame>
    );
  }

  return (
    <AdminFrame
      email={access.email}
      onSignOut={handleSignOut}
      showSignOut
    >
      <Studio />
    </AdminFrame>
  );
}

function AdminFrame({
  children,
  email,
  onSignOut,
  showSignOut,
}: {
  children: React.ReactNode;
  email?: string | null;
  onSignOut: () => void;
  showSignOut: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f8f2ea]">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-[1.5rem] font-semibold leading-none tracking-[-0.045em] text-ink">
              Trendora
            </span>
            <span className="rounded-full bg-blush px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-primary">
              owner studio
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="hidden h-9 rounded-full px-4 text-[11px] font-medium text-foreground/70 hover:text-primary sm:inline-flex"
            >
              <Link to="/shop">
                <ArrowLeft className="size-3.5" />
                View storefront
              </Link>
            </Button>
            {email && (
              <span className="hidden max-w-44 truncate text-[11px] text-muted-foreground md:inline">
                {email}
              </span>
            )}
            {showSignOut && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSignOut}
                className="h-9 rounded-full border-border px-4 text-[11px] font-medium"
              >
                <LogOut className="size-3.5" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {children}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 sm:px-6 lg:px-8">
        Trendora owner studio · signed-in workspace
      </footer>
    </div>
  );
}

function Studio() {
  const products = useQuery(api.products.adminList);
  const setStock = useMutation(api.products.setStock);
  const setActive = useMutation(api.products.setActive);
  const removeProduct = useMutation(api.products.removeProduct);
  const restoreSamples = useMutation(api.products.restoreSamples);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | "live" | "draft">("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ProductType | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [busyStockId, setBusyStockId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ProductType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const createProduct = useMutation(api.products.createProduct);
  const updateProduct = useMutation(api.products.updateProduct);

  const stats = useMemo(() => {
    const list = products ?? [];
    return {
      total: list.length,
      live: list.filter((product) => product.isActive).length,
      low: list.filter((product) => product.stock <= 3).length,
      value: list.reduce((sum, product) => sum + product.price * product.stock, 0),
    };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (category !== "all") {
      list = list.filter((product) => product.category === category);
    }
    if (status !== "all") {
      list = list.filter((product) =>
        status === "live" ? product.isActive : !product.isActive,
      );
    }
    if (lowStockOnly) {
      list = list.filter((product) => product.stock <= 3);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((product) =>
        `${product.name} ${categoryLabel(product.category)}`
          .toLowerCase()
          .includes(term),
      );
    }
    return list;
  }, [products, category, status, lowStockOnly, search]);

  function openNew() {
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setFormError(null);
    setEditorOpen(true);
  }

  function openEdit(product: ProductType) {
    setEditing(product);
    setDraft(draftFrom(product));
    setFormError(null);
    setEditorOpen(true);
  }

  function updateDraft<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function payloadFromDraft(source: Draft) {
    return {
      name: source.name.trim(),
      category: source.category,
      description: source.description.trim(),
      details: source.details
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      price: Number(source.price),
      compareAtPrice: source.compareAtPrice
        ? Number(source.compareAtPrice)
        : undefined,
      images: source.images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      sizes: source.sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      colours: source.colours
        .split(",")
        .map((item) => {
          const [name, hex] = item.split(":");
          return {
            name: (name ?? "").trim(),
            hex: (hex ?? "#D9CBB8").trim(),
          };
        })
        .filter((colour) => colour.name),
      stock: Number(source.stock),
      featured: source.featured,
      isActive: source.isActive,
      badge: source.badge.trim() || undefined,
    };
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!draft.name.trim()) {
      setFormError("Give the piece a name.");
      return;
    }
    if (!draft.description.trim()) {
      setFormError("Add a short description for the product page.");
      return;
    }
    if (!draft.price || Number(draft.price) <= 0) {
      setFormError("Set a price greater than zero.");
      return;
    }
    if (Number(draft.stock) < 0 || Number.isNaN(Number(draft.stock))) {
      setFormError("Inventory must be zero or more.");
      return;
    }

    setSaving(true);
    try {
      const payload = payloadFromDraft(draft);
      if (editing) {
        await updateProduct({ id: editing._id, ...payload });
        toast.success("Piece updated", { description: draft.name.trim() });
      } else {
        await createProduct(payload);
        toast.success("Piece published", {
          description: `${draft.name.trim()} is now in the studio.`,
        });
      }
      setEditorOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "The piece could not be saved. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function adjustStock(product: ProductType, next: number) {
    if (next < 0) return;
    setBusyStockId(product._id);
    try {
      await setStock({ id: product._id, stock: next });
    } catch (error) {
      toast.error("Inventory could not be updated", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setBusyStockId(null);
    }
  }

  async function toggleActive(product: ProductType, isActive: boolean) {
    try {
      await setActive({ id: product._id, isActive });
      toast.success(isActive ? "Piece is live" : "Piece moved to drafts", {
        description: product.name,
      });
    } catch (error) {
      toast.error("Status could not be updated", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await removeProduct({ id: toDelete._id });
      toast.success("Piece removed", { description: toDelete.name });
      setToDelete(null);
    } catch (error) {
      toast.error("Piece could not be removed", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function loadSamples() {
    setSeeding(true);
    try {
      const result = await restoreSamples();
      toast.success("Sample edit published", {
        description: `${result.count} pieces added to the studio.`,
      });
    } catch (error) {
      toast.error("Sample edit could not be loaded", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSeeding(false);
    }
  }

  const activeFilters =
    (category !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (lowStockOnly ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Owner studio</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">
            Your boutique, at a glance.
          </h1>
          <p className="mt-3 max-w-lg text-[13px] leading-6 text-muted-foreground">
            Publish new pieces, keep inventory honest, and decide what stays on
            the shopfront. Changes are live immediately.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-border bg-card px-4 text-[11px] font-semibold uppercase tracking-[0.1em]"
          >
            <Link to="/shop">
              <Store className="size-3.5" />
              Shopfront
            </Link>
          </Button>
          <Button
            type="button"
            onClick={openNew}
            className="h-10 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            <Plus className="size-4" />
            New piece
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total pieces"
          value={String(stats.total)}
          note="in the studio"
        />
        <StatCard
          icon={Store}
          label="Live on the shop"
          value={String(stats.live)}
          note={`${stats.total - stats.live} in drafts`}
        />
        <button
          type="button"
          onClick={() => setLowStockOnly((current) => !current)}
          className={cn(
            "rounded-[1.15rem] border p-4 text-left transition-all sm:p-5",
            lowStockOnly
              ? "border-primary/40 bg-blush/70 ring-1 ring-primary/20"
              : "border-border/80 bg-card hover:border-primary/30",
          )}
        >
          <div className="flex items-center justify-between">
            <AlertTriangle
              className={cn(
                "size-4",
                stats.low > 0 ? "text-marigold" : "text-muted-foreground",
              )}
            />
            {lowStockOnly && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                Filtered
              </span>
            )}
          </div>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            {stats.low}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
            Low stock
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/80">
            3 pieces or fewer
          </p>
        </button>
        <StatCard
          icon={CircleDollarSign}
          label="Catalogue value"
          value={formatPrice(stats.value)}
          note="at retail"
        />
      </div>

      <section className="mt-8 rounded-[1.3rem] border border-border/80 bg-card">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 lg:flex-row lg:items-center">
          <div className="relative min-w-[190px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pieces…"
              aria-label="Search products in the studio"
              className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-3 text-[12px] outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 w-[150px] rounded-full bg-background text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item.slug} value={item.slug}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as "all" | "live" | "draft")
              }
            >
              <SelectTrigger className="h-10 w-[130px] rounded-full bg-background text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant={lowStockOnly ? "default" : "outline"}
              onClick={() => setLowStockOnly((current) => !current)}
              className={cn(
                "h-10 rounded-full px-4 text-[11px] font-medium",
                !lowStockOnly && "border-border bg-background",
              )}
            >
              <AlertTriangle className="size-3.5" />
              Low stock
            </Button>

            {activeFilters > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                  setStatus("all");
                  setLowStockOnly(false);
                }}
                className="text-[10px] font-medium text-muted-foreground underline decoration-border underline-offset-4 hover:text-primary"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {products === undefined ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-blush text-primary">
              <Package className="size-5" />
            </div>
            <h2 className="mt-4 font-display text-2xl tracking-tight text-ink">
              The rail is empty
            </h2>
            <p className="mt-2 max-w-sm text-[13px] leading-6 text-muted-foreground">
              Add your first piece, or publish the sample launch edit to see how
              the storefront works.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                onClick={loadSamples}
                disabled={seeding}
                variant="outline"
                className="rounded-full"
              >
                {seeding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Load sample edit
              </Button>
              <Button type="button" onClick={openNew} className="rounded-full">
                <Plus className="size-4" />
                New piece
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-xl text-ink">
              No pieces match these filters
            </p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Try a different category or clear the studio filters.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setStatus("all");
                setLowStockOnly(false);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/70 hover:bg-transparent">
                    <TableHead className="pl-4 text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                      Piece
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                      Inventory
                    </TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                      Shopfront
                    </TableHead>
                    <TableHead className="pr-4 text-right text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                      Manage
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((product) => (
                    <TableRow
                      key={product._id}
                      className="border-border/60 hover:bg-sand/25"
                    >
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3 py-1">
                          <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate font-display text-sm font-medium text-ink">
                              {product.name}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              {product.badge && (
                                <span className="rounded-full bg-blush px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-primary">
                                  {product.badge}
                                </span>
                              )}
                              {product.sizes.length} sizes ·{" "}
                              {product.colours.length}{" "}
                              {product.colours.length === 1 ? "colour" : "colours"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">
                        {categoryLabel(product.category)}
                      </TableCell>
                      <TableCell>
                        <p className="text-[12px] font-medium text-ink">
                          {formatPrice(product.price)}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <StockStepper
                          stock={product.stock}
                          busy={busyStockId === product._id}
                          onChange={(next) => adjustStock(product, next)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={(checked) =>
                              toggleActive(product, checked)
                            }
                            aria-label={`${product.isActive ? "Move" : "Publish"} ${product.name}`}
                          />
                          <span
                            className={cn(
                              "text-[10px] font-medium uppercase tracking-[0.08em]",
                              product.isActive
                                ? "text-[#5f7a52]"
                                : "text-muted-foreground",
                            )}
                          >
                            {product.isActive ? "Live" : "Draft"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full text-muted-foreground hover:text-primary"
                          >
                            <Link
                              to={`/product/${product.slug}`}
                              aria-label={`Preview ${product.name}`}
                            >
                              <ArrowUpRight className="size-3.5" />
                            </Link>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full text-muted-foreground hover:text-destructive"
                            onClick={() => setToDelete(product)}
                            aria-label={`Remove ${product.name}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-border/60 md:hidden">
              {filtered.map((product) => (
                <div key={product._id} className="p-4">
                  <div className="flex gap-3">
                    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                      <ProductImage src={product.images[0]} alt={product.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-sm font-medium leading-snug text-ink">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                            {categoryLabel(product.category)}
                          </p>
                        </div>
                        <p className="text-[12px] font-medium text-ink">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <StockStepper
                          stock={product.stock}
                          busy={busyStockId === product._id}
                          onChange={(next) => adjustStock(product, next)}
                        />
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={product.isActive}
                            onCheckedChange={(checked) =>
                              toggleActive(product, checked)
                            }
                            aria-label={`${product.isActive ? "Move" : "Publish"} ${product.name}`}
                          />
                          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            {product.isActive ? "Live" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 rounded-full text-[11px] text-muted-foreground"
                    >
                      <Link to={`/product/${product.slug}`}>
                        <ArrowUpRight className="size-3.5" />
                        Preview
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(product)}
                      className="h-8 rounded-full text-[11px] text-muted-foreground"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setToDelete(product)}
                      className="h-8 rounded-full text-[11px] text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
        Showing {filtered.length} of {products?.length ?? 0} pieces
      </p>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[1.4rem] border-border bg-background p-0 sm:max-w-2xl">
          <form onSubmit={saveProduct}>
            <DialogHeader className="border-b border-border/70 px-6 py-5 text-left">
              <DialogTitle className="font-display text-2xl tracking-tight">
                {editing ? "Edit piece" : "New piece"}
              </DialogTitle>
              <DialogDescription className="text-[12px]">
                {editing
                  ? `Update ${editing.name} across the shopfront.`
                  : "Add a piece to the launch rail. Drafts stay hidden until published."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="piece-name" className="field-label">
                    Name
                  </Label>
                  <Input
                    id="piece-name"
                    value={draft.name}
                    onChange={(event) => updateDraft("name", event.target.value)}
                    placeholder="Aurelia Silk Slip Dress"
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                </div>

                <div>
                  <Label className="field-label">Category</Label>
                  <Select
                    value={draft.category}
                    onValueChange={(value) => updateDraft("category", value)}
                  >
                    <SelectTrigger className="mt-2 h-10 w-full rounded-xl bg-card text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CATEGORIES.map((item) => (
                        <SelectItem key={item.slug} value={item.slug}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="piece-badge" className="field-label">
                    Badge <span className="normal-case tracking-normal">(optional)</span>
                  </Label>
                  <Input
                    id="piece-badge"
                    value={draft.badge}
                    onChange={(event) => updateDraft("badge", event.target.value)}
                    placeholder="Bestseller"
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                </div>

                <div>
                  <Label htmlFor="piece-price" className="field-label">
                    Price (USD)
                  </Label>
                  <Input
                    id="piece-price"
                    type="number"
                    min="1"
                    step="1"
                    value={draft.price}
                    onChange={(event) => updateDraft("price", event.target.value)}
                    placeholder="189"
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                </div>

                <div>
                  <Label htmlFor="piece-compare" className="field-label">
                    Compare at <span className="normal-case tracking-normal">(optional)</span>
                  </Label>
                  <Input
                    id="piece-compare"
                    type="number"
                    min="0"
                    step="1"
                    value={draft.compareAtPrice}
                    onChange={(event) =>
                      updateDraft("compareAtPrice", event.target.value)
                    }
                    placeholder="240"
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                </div>

                <div>
                  <Label htmlFor="piece-stock" className="field-label">
                    Inventory
                  </Label>
                  <Input
                    id="piece-stock"
                    type="number"
                    min="0"
                    step="1"
                    value={draft.stock}
                    onChange={(event) => updateDraft("stock", event.target.value)}
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                </div>

                <div>
                  <Label htmlFor="piece-sizes" className="field-label">
                    Sizes
                  </Label>
                  <Input
                    id="piece-sizes"
                    value={draft.sizes}
                    onChange={(event) => updateDraft("sizes", event.target.value)}
                    placeholder="XS, S, M, L"
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="piece-colours" className="field-label">
                    Colours
                  </Label>
                  <Input
                    id="piece-colours"
                    value={draft.colours}
                    onChange={(event) => updateDraft("colours", event.target.value)}
                    placeholder="Ivory: #EFE7DA, Espresso: #4A342C"
                    className="mt-2 h-10 rounded-xl bg-card"
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    Format: Name: #hex, Name: #hex
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="piece-images" className="field-label">
                    Image URLs
                  </Label>
                  <Textarea
                    id="piece-images"
                    value={draft.images}
                    onChange={(event) => updateDraft("images", event.target.value)}
                    placeholder="https://images.unsplash.com/photo-…"
                    rows={3}
                    className="mt-2 resize-y rounded-xl bg-card text-[12px]"
                  />
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    One per line. The first image is the card image.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="piece-description" className="field-label">
                    Description
                  </Label>
                  <Textarea
                    id="piece-description"
                    value={draft.description}
                    onChange={(event) =>
                      updateDraft("description", event.target.value)
                    }
                    rows={3}
                    placeholder="The story of this piece, in a sentence or two."
                    className="mt-2 resize-y rounded-xl bg-card text-[13px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="piece-details" className="field-label">
                    Details <span className="normal-case tracking-normal">(one per line)</span>
                  </Label>
                  <Textarea
                    id="piece-details"
                    value={draft.details}
                    onChange={(event) => updateDraft("details", event.target.value)}
                    rows={3}
                    placeholder={"100% mulberry silk\nDry clean only"}
                    className="mt-2 resize-y rounded-xl bg-card text-[12px]"
                  />
                </div>
              </div>

              <div className="grid gap-3 rounded-xl border border-border/70 bg-card p-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium text-ink">
                      Publish to shopfront
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Visible to shoppers straight away
                    </p>
                  </div>
                  <Switch
                    checked={draft.isActive}
                    onCheckedChange={(checked) =>
                      updateDraft("isActive", checked)
                    }
                    aria-label="Publish to shopfront"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-medium text-ink">
                      Feature in trending
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Move this piece to the front of the rail
                    </p>
                  </div>
                  <Switch
                    checked={draft.featured}
                    onCheckedChange={(checked) =>
                      updateDraft("featured", checked)
                    }
                    aria-label="Feature in trending"
                  />
                </div>
              </div>

              {formError && (
                <p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-[12px] text-destructive">
                  {formError}
                </p>
              )}
            </div>

            <DialogFooter className="border-t border-border/70 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditorOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.12em]"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Check className="size-4" />
                )}
                {editing ? "Save changes" : "Publish piece"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-[1.3rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl tracking-tight">
              Remove this piece?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-6">
              {toDelete?.name} will be removed from the studio and shopfront.
              This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Remove piece
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-border/80 bg-card p-4 sm:p-5">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground/80">{note}</p>
    </div>
  );
}

function StockStepper({
  stock,
  busy,
  onChange,
}: {
  stock: number;
  busy: boolean;
  onChange: (stock: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background">
      <button
        type="button"
        onClick={() => onChange(stock - 1)}
        disabled={busy || stock === 0}
        className="flex size-7 items-center justify-center rounded-l-full text-muted-foreground transition-colors hover:bg-sand disabled:opacity-40"
        aria-label="Decrease inventory"
      >
        <Minus className="size-3" />
      </button>
      <span
        className={cn(
          "flex min-w-8 items-center justify-center px-1 text-[11px] font-medium tabular-nums",
          stock <= 3 ? "text-primary" : "text-ink",
          busy && "opacity-50",
        )}
      >
        {busy ? "…" : stock}
      </span>
      <button
        type="button"
        onClick={() => onChange(stock + 1)}
        disabled={busy}
        className="flex size-7 items-center justify-center rounded-r-full text-muted-foreground transition-colors hover:bg-sand disabled:opacity-40"
        aria-label="Increase inventory"
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}
