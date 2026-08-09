import { Suspense } from "react";
import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import {
  FeaturedCollections,
} from "@/components/sections/FeaturedCollections";
import { TrendingRow } from "@/components/sections/TrendingRow";
import { CollectionCard } from "@/components/CollectionCard";
import { CollectionCardSkeleton } from "@/components/CollectionCard";
import { TrendingHeroBackdrop } from "@/components/sections/TrendingHeroBackdrop";
import { getAllCollections, getCollectionBySlug } from "@/lib/collections";

export const revalidate = 3600; // Re-read collection JSON at most hourly.

function LatestCollectionsGrid() {
  const collections = getAllCollections();
  return (
    <section id="latest-collections" className="container space-y-6 py-12">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Fresh drops
        </p>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Latest Collections</h2>
      </div>

      {collections.length === 0 ? (
        <EmptyCollections />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((meta) => {
            const full = getCollectionBySlug(meta.slug);
            return (
              <CollectionCard
                key={meta.slug}
                collection={meta}
                movieNames={full?.movies ?? []}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function EmptyCollections() {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        No collections yet. Drop a JSON file into{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
          data/collections/
        </code>{" "}
        and it will appear here automatically.
      </p>
    </div>
  );
}

function LatestSkeleton() {
  return (
    <section className="container space-y-6 py-12">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/5" />
        <div className="h-8 w-64 rounded bg-white/5" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <CollectionCardSkeleton />
        <CollectionCardSkeleton />
        <CollectionCardSkeleton />
      </div>
    </section>
  );
}

export default function HomePage() {
  const collections = getAllCollections();
  const totalMovies = collections.reduce((sum, c) => sum + c.totalMovies, 0);
  const featured = collections[0];

  return (
    <div className="pb-8">
      <HeroBanner
        backdropSlot={<TrendingHeroBackdrop />}
        cta={
          featured
            ? { label: "Explore Featured Collection", href: `/collection/${featured.slug}` }
            : undefined
        }
        stats={[
          { label: "Curated collections", value: String(collections.length) },
          { label: "Movies ready to stream", value: `${totalMovies}+` },
        ]}
      />

      <Suspense fallback={<LatestSkeleton />}>
        <FeaturedCollections collections={collections} />
      </Suspense>

      <Suspense fallback={null}>
        <TrendingRow />
      </Suspense>

      <Suspense fallback={<LatestSkeleton />}>
        <LatestCollectionsGrid />
      </Suspense>
    </div>
  );
}
