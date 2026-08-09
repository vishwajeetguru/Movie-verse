"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollectionCard, CollectionCardSkeleton } from "@/components/CollectionCard";
import { getCollectionBySlug } from "@/lib/collections";
import type { Collection, CollectionMeta } from "@/types";

interface FeaturedCollectionsProps {
  collections: CollectionMeta[];
}

interface Resolved {
  meta: CollectionMeta;
  movies: string[];
}

/**
 * Featured = the most recent collections (last JSON files added),
 * resolving movie names so poster previews can load.
 */
export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  const [resolved, setResolved] = useState<Resolved[]>([]);

  useEffect(() => {
    const data = collections
      .slice(0, 3)
      .map((meta) => {
        const full: (Collection & { slug: string }) | null = getCollectionBySlug(meta.slug);
        if (!full) return null;
        return { meta, movies: full.movies };
      })
      .filter((r): r is Resolved => r !== null);
    setResolved(data);
  }, [collections]);

  return (
    <section id="collections" className="container space-y-6 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Hand-picked
          </p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Featured Collections</h2>
        </div>
        <Link
          href="#latest-collections"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {resolved.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <CollectionCardSkeleton />
          <CollectionCardSkeleton />
          <CollectionCardSkeleton />
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resolved.map(({ meta, movies }, i) => (
            <CollectionCard
              key={meta.slug}
              collection={meta}
              movieNames={movies}
              featured={i === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
