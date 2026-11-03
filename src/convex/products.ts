import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { SAMPLE_PRODUCTS } from "./catalogue";
import { colourValidator } from "./schema";

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Please sign in as the boutique owner.");
  }
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Owner access is required for this action.");
  }
  return userId;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "trendora-piece"
  );
}

async function uniqueSlug(ctx: MutationCtx, name: string, ignoreId?: Id<"products">) {
  const base = slugify(name);
  let candidate = base;
  let attempt = 2;
  while (true) {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .first();
    if (!existing || existing._id === ignoreId) return candidate;
    candidate = `${base}-${attempt}`;
    attempt += 1;
  }
}

const productFields = {
  name: v.string(),
  category: v.string(),
  description: v.string(),
  details: v.array(v.string()),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  images: v.array(v.string()),
  sizes: v.array(v.string()),
  colours: v.array(colourValidator),
  stock: v.number(),
  featured: v.boolean(),
  isActive: v.boolean(),
  badge: v.optional(v.string()),
};

/** Storefront catalogue — active pieces only. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return products.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt,
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!product || !product.isActive) return null;
    return product;
  },
});

/** Who is signed in, whether an owner exists, and whether this user can claim it. */
export const adminAccess = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .take(1);
    const hasAdmin = admins.length > 0;

    if (userId === null) {
      return {
        signedIn: false,
        isAdmin: false,
        hasAdmin,
        canClaim: false,
        email: null as string | null,
      };
    }

    const user = await ctx.db.get(userId);
    const email = user?.email ?? null;
    const isAdmin = user?.role === "admin";

    return {
      signedIn: true,
      isAdmin,
      hasAdmin,
      canClaim: !hasAdmin && !user?.isAnonymous && Boolean(email),
      email,
    };
  },
});

/**
 * First-run owner bootstrap: the first verified email account can claim the
 * studio. An existing owner always keeps control.
 */
export const claimAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Please sign in first.");

    const user = await ctx.db.get(userId);
    if (!user || user.isAnonymous || !user.email) {
      throw new Error("Sign in with an email address to claim the studio.");
    }
    if (user.role === "admin") return { claimed: true };

    const existingAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .take(1);
    if (existingAdmin.length > 0) {
      throw new Error("This store already has an owner.");
    }

    await ctx.db.patch(userId, { role: "admin" });
    return { claimed: true };
  },
});

const SEED_MARKER = "launch-catalogue-seeded";

async function insertSamples(ctx: MutationCtx) {
  const startedAt = Date.now();
  for (const [index, product] of SAMPLE_PRODUCTS.entries()) {
    await ctx.db.insert("products", {
      ...product,
      createdAt: startedAt - index * 60_000,
      isActive: true,
    });
  }
}

/**
 * Seed the sample launch edit once, so a fresh store is never empty. The marker
 * means an owner who intentionally clears the catalogue stays cleared.
 */
export const ensureSeeded = mutation({
  args: {},
  handler: async (ctx) => {
    const marker = await ctx.db
      .query("storeMeta")
      .withIndex("by_key", (q) => q.eq("key", SEED_MARKER))
      .first();
    if (marker) return { seeded: false };

    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) {
      await ctx.db.insert("storeMeta", {
        key: SEED_MARKER,
        value: String(Date.now()),
      });
      return { seeded: false };
    }

    await insertSamples(ctx);
    await ctx.db.insert("storeMeta", {
      key: SEED_MARKER,
      value: String(Date.now()),
    });
    return { seeded: true, count: SAMPLE_PRODUCTS.length };
  },
});

/** Owner-only sample edit restore for a deliberately empty catalogue. */
export const restoreSamples = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) {
      throw new Error("Remove or archive the current pieces first.");
    }
    await insertSamples(ctx);
    return { restored: true, count: SAMPLE_PRODUCTS.length };
  },
});

/** Everything in the studio, including drafts. Owner only. */
export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const products = await ctx.db.query("products").collect();
    return products.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || b.createdAt - a.createdAt,
    );
  },
});

export const createProduct = mutation({
  args: { ...productFields },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const slug = await uniqueSlug(ctx, args.name);

    const id = await ctx.db.insert("products", {
      name: args.name.trim(),
      slug,
      category: args.category,
      description: args.description.trim(),
      details: args.details.filter(Boolean),
      price: Math.max(0, Math.round(args.price)),
      compareAtPrice:
        args.compareAtPrice && args.compareAtPrice > args.price
          ? Math.round(args.compareAtPrice)
          : undefined,
      images: args.images.filter(Boolean),
      sizes: args.sizes.filter(Boolean),
      colours: args.colours.filter((colour) => colour.name.trim()),
      stock: Math.max(0, Math.floor(args.stock)),
      rating: 0,
      reviewCount: 0,
      isActive: args.isActive,
      featured: args.featured,
      badge: args.badge?.trim() || undefined,
      createdAt: Date.now(),
    });

    return { id, slug };
  },
});

export const updateProduct = mutation({
  args: { id: v.id("products"), ...productFields },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("That piece no longer exists.");

    const slug = await uniqueSlug(ctx, args.name, args.id);

    await ctx.db.patch(args.id, {
      name: args.name.trim(),
      slug,
      category: args.category,
      description: args.description.trim(),
      details: args.details.filter(Boolean),
      price: Math.max(0, Math.round(args.price)),
      compareAtPrice:
        args.compareAtPrice && args.compareAtPrice > args.price
          ? Math.round(args.compareAtPrice)
          : undefined,
      images: args.images.filter(Boolean),
      sizes: args.sizes.filter(Boolean),
      colours: args.colours.filter((colour) => colour.name.trim()),
      stock: Math.max(0, Math.floor(args.stock)),
      isActive: args.isActive,
      featured: args.featured,
      badge: args.badge?.trim() || undefined,
    });

    return { id: args.id, slug };
  },
});

export const setStock = mutation({
  args: { id: v.id("products"), stock: v.number() },
  handler: async (ctx, { id, stock }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(id);
    if (!product) throw new Error("That piece no longer exists.");
    await ctx.db.patch(id, { stock: Math.max(0, Math.floor(stock)) });
  },
});

export const setActive = mutation({
  args: { id: v.id("products"), isActive: v.boolean() },
  handler: async (ctx, { id, isActive }) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(id);
    if (!product) throw new Error("That piece no longer exists.");
    await ctx.db.patch(id, { isActive });
  },
});

export const removeProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const product: Doc<"products"> | null = await ctx.db.get(id);
    if (!product) return { removed: false };
    await ctx.db.delete(id);
    return { removed: true };
  },
});
