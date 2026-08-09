import type { Collection, CollectionMeta } from "@/types";
import { slugify } from "@/lib/utils";

/**
 * Collections are local JSON files stored in /data/collections.
 * Add a new .json file there and it is picked up automatically —
 * no code changes needed (uses webpack require.context at build time).
 */

interface CollectionFile extends Collection {
  /** Optional explicit slug override inside the JSON file. */
  slug?: string;
}

function loadCollections(): (CollectionFile & { fileSlug: string })[] {
  // require.context is available because this app bundles with webpack (Next.js).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const context = require.context("@/data/collections", false, /\.json$/);
  return context.keys().map((key: string) => {
    const data = context(key) as CollectionFile;
    const fileSlug = key.replace(/^\.\//, "").replace(/\.json$/, "");
    return { ...data, fileSlug };
  });
}

/** Get metadata for every collection (featured first, newest files last). */
export function getAllCollections(): CollectionMeta[] {
  return loadCollections().map((c) => ({
    slug: c.slug ?? slugify(c.title) ?? c.fileSlug,
    title: c.title,
    youtubeUrl: c.youtubeUrl,
    totalMovies: c.movies?.length ?? 0,
  }));
}

/** Get a single collection (with movie names) by slug. */
export function getCollectionBySlug(
  slug: string
): (Collection & { slug: string }) | null {
  const all = loadCollections();
  const found = all.find(
    (c) => (c.slug ?? slugify(c.title)) === slug || c.fileSlug === slug
  );
  if (!found) return null;
  return {
    slug,
    title: found.title,
    youtubeUrl: found.youtubeUrl,
    movies: found.movies ?? [],
  };
}

/** Get all slugs (used by generateStaticParams / sitemap). */
export function getAllCollectionSlugs(): string[] {
  return getAllCollections().map((c) => c.slug);
}

/** Search collections by title (case-insensitive substring). */
export function searchCollections(query: string): CollectionMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllCollections().filter((c) => c.title.toLowerCase().includes(q));
}
