"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Info,
  Star,
} from "lucide-react";
import { getImageUrl, getMovieDetails } from "@/lib/tmdb";
import { cn, formatRating, formatRuntime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RelatedMovies } from "@/components/sections/RelatedMovies";
import { WatchPageSkeleton } from "@/components/LoadingSkeletons";
import type { TMDBMovieDetails } from "@/types";

// Player is iframe-heavy — load it client-side only, on demand.
const PlayerSection = dynamic(
  () => import("@/components/PlayerSection").then((m) => m.PlayerSection),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/10 bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-primary" />
      </div>
    ),
  }
);

interface WatchClientProps {
  tmdbId: number;
}

export function WatchClient({ tmdbId }: WatchClientProps) {
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(tmdbId)) {
      setError("Invalid movie id.");
      return;
    }
    const controller = new AbortController();
    getMovieDetails(tmdbId, { signal: controller.signal })
      .then((details) => {
        if (controller.signal.aborted) return;
        setMovie(details);
        document.title = `Watch ${details.title} | MovieVerse`;
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setError("Couldn't load this movie. Check your TMDB API key.");
        }
      });
    return () => controller.abort();
  }, [tmdbId]);

  if (error) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="glass">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    );
  }

  if (!movie) return <WatchPageSkeleton />;

  return (
    <div className="relative pb-16">
      {/* Ambient backdrop */}
      {movie.backdrop_path && (
        <div className="absolute inset-x-0 top-0 h-[420px] overflow-hidden" aria-hidden>
          <Image
            src={getImageUrl(movie.backdrop_path, "w1280")}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
      )}

      <div className="container relative space-y-8 py-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-2 text-muted-foreground">
            <Link href={`/movie/${movie.id}`}>
              <ArrowLeft className="h-4 w-4" />
              Movie details
            </Link>
          </Button>
          <Button
            variant="glass"
            size="sm"
            className="gap-2"
            onClick={() => setShowInfo((v) => !v)}
          >
            <Info className="h-4 w-4" />
            {showInfo ? "Hide info" : "Show info"}
          </Button>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold sm:text-2xl"
        >
          {movie.title}
        </motion.h1>

        {/* Player */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <PlayerSection tmdbId={movie.id} title={movie.title} />
        </motion.div>

        {/* Movie info */}
        {showInfo && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-6 p-5 sm:flex-row sm:p-7">
              <div className="relative hidden aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block">
                <Image
                  src={getImageUrl(movie.poster_path, "w342")}
                  alt={movie.title}
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 text-yellow-400">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    <span className={cn("font-semibold")}>
                      {formatRating(movie.vote_average)}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {movie.release_date || "TBA"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatRuntime(movie.runtime)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Badge key={g.id} variant="glass">
                      {g.name}
                    </Badge>
                  ))}
                </div>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {movie.overview}
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Related */}
        <RelatedMovies tmdbId={movie.id} />
      </div>
    </div>
  );
}
