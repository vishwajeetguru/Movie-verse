"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { formatRating, getYear } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TMDBGenre, TMDBMovie } from "@/types";

interface MovieCardProps {
  movie: TMDBMovie;
  /** Position inside a collection (shows "#3" badge). */
  rank?: number;
  /** Optional genre lookup map for label chips. */
  genreMap?: Map<number, string>;
  /** Link back to a collection so "Back to Collection" works. */
  fromCollection?: string;
  priority?: boolean;
}

export function MovieCard({
  movie,
  rank,
  genreMap,
  fromCollection,
  priority = false,
}: MovieCardProps) {
  const href = fromCollection
    ? `/movie/${movie.id}?from=${encodeURIComponent(fromCollection)}`
    : `/movie/${movie.id}`;

  const genreNames =
    genreMap && movie.genre_ids
      ? movie.genre_ids
          .slice(0, 2)
          .map((id) => genreMap.get(id))
          .filter((g): g is string => Boolean(g))
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link href={href} className="block" aria-label={movie.title}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-card shadow-lg shadow-black/40 transition-shadow duration-300 group-hover:shadow-primary/20">
          <Image
            src={getImageUrl(movie.poster_path, "w342")}
            alt={movie.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Rank badge */}
          {typeof rank === "number" && (
            <div className="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-black/70 text-sm font-bold text-white backdrop-blur-md border border-white/15">
              #{rank}
            </div>
          )}

          {/* Rating badge */}
          <div className="absolute right-2 top-2 z-10">
            <Badge variant="rating" className="gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatRating(movie.vote_average)}
            </Badge>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute bottom-0 w-full p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-white/80">
                <span>{getYear(movie.release_date)}</span>
                {genreNames.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 backdrop-blur-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Play className="h-4 w-4 fill-white text-white" />
                </span>
                View Details
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2.5 space-y-0.5 px-0.5">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {getYear(movie.release_date)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="space-y-2.5">
      <div className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
      <div className="h-3 w-1/3 rounded bg-white/5 animate-pulse" />
    </div>
  );
}

/** Merge TMDB genre list into a lookup map: new Map(genres.map(g => [g.id, g.name])) */
export function buildGenreMap(genres: TMDBGenre[]): Map<number, string> {
  return new Map(genres.map((g) => [g.id, g.name]));
}
