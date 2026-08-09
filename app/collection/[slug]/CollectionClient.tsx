"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Clapperboard, Youtube } from "lucide-react";
import { MovieGrid, MovieGridSkeleton } from "@/components/MovieGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getYouTubeId } from "@/lib/utils";
import { useCollectionMovies } from "@/hooks/useCollectionMovies";
import type { Collection } from "@/types";

interface CollectionClientProps {
  collection: Collection & { slug: string };
}

const GENRE_MAP = new Map<number, string>([
  [28, "Action"], [12, "Adventure"], [16, "Animation"], [35, "Comedy"],
  [80, "Crime"], [99, "Documentary"], [18, "Drama"], [10751, "Family"],
  [14, "Fantasy"], [36, "History"], [27, "Horror"], [10402, "Music"],
  [9648, "Mystery"], [10749, "Romance"], [878, "Sci-Fi"], [53, "Thriller"],
  [10752, "War"], [37, "Western"],
]);

export function CollectionClient({ collection }: CollectionClientProps) {
  const { movies, failed, isLoading, error } = useCollectionMovies(collection.movies);
  const youtubeId = collection.youtubeUrl ? getYouTubeId(collection.youtubeUrl) : null;

  const jsonLd =
    movies.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: collection.title,
          numberOfItems: movies.length,
          itemListElement: movies.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.title,
          })),
        }
      : null;

  return (
    <div className="container space-y-10 py-8 sm:py-12">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          All collections
        </Link>
      </Button>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-10"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]"
          aria-hidden
        />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="glass" className="gap-1.5">
              <Clapperboard className="h-3 w-3" />
              {collection.movies.length} movies
            </Badge>
            {collection.youtubeUrl && (
              <a
                href={collection.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Badge variant="glass" className="gap-1.5 text-red-400 transition-colors hover:bg-red-500/20">
                  <Youtube className="h-3.5 w-3.5" />
                  Watch the video
                </Badge>
              </a>
            )}
          </div>
          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight sm:text-4xl">
            {collection.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Every title below was resolved against TMDB with posters, ratings and
            trailers — click any movie for details or jump straight to streaming.
          </p>
        </div>
      </motion.header>

      {/* YouTube embed (when the curator's video exists) */}
      {youtubeId && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Youtube className="h-5 w-5 text-red-500" />
            The Original Video
          </h2>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={collection.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </motion.section>
      )}

      {/* Movie grid */}
      <section className="space-y-5">
        <h2 className="text-lg font-bold sm:text-xl">The List</h2>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <MovieGridSkeleton count={Math.max(collection.movies.length, 6)} />
        ) : (
          <>
            <MovieGrid
              movies={movies}
              ranked
              genreMap={GENRE_MAP}
              fromCollection={collection.slug}
            />
            {failed.length > 0 && (
              <p className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground">
                Couldn&apos;t resolve on TMDB: {failed.join(", ")}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
