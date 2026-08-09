"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Languages,
  Play,
  Star,
} from "lucide-react";
import { getImageUrl, getMovieCredits, getMovieDetails } from "@/lib/tmdb";
import { formatRating, formatRuntime, getYear } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrailerButton } from "@/components/TrailerModal";
import { RelatedMovies } from "@/components/sections/RelatedMovies";
import { MovieDetailSkeleton } from "@/components/LoadingSkeletons";
import type { TMDBCredits, TMDBMovieDetails } from "@/types";

interface MovieDetailClientProps {
  tmdbId: number;
}

export function MovieDetailClient({ tmdbId }: MovieDetailClientProps) {
  const searchParams = useSearchParams();
  const fromCollection = searchParams.get("from");

  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(tmdbId)) {
      setError("Invalid movie id.");
      return;
    }
    const controller = new AbortController();

    Promise.all([
      getMovieDetails(tmdbId, { signal: controller.signal }),
      getMovieCredits(tmdbId, { signal: controller.signal }),
    ])
      .then(([details, creds]) => {
        if (controller.signal.aborted) return;
        setMovie(details);
        setCredits(creds);
        document.title = `${details.title} (${getYear(details.release_date)}) | MovieVerse`;
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") {
          setError("Couldn't load this movie. Check your TMDB API key and try again.");
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

  if (!movie) return <MovieDetailSkeleton />;

  const topCast = credits?.cast.slice(0, 12) ?? [];
  const director = credits?.crew.find((c) => c.job === "Director");

  return (
    <div className="pb-16">
      {/* Backdrop hero */}
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden sm:h-[55vh]">
        <Image
          src={getImageUrl(movie.backdrop_path, "w1280")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      </div>

      <div className="container -mt-36 space-y-12 sm:-mt-48">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 mx-auto w-44 shrink-0 sm:w-60 md:mx-0"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/60">
              <Image
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                fill
                priority
                sizes="(max-width: 768px) 176px, 240px"
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative z-10 flex-1 space-y-5 md:pt-44"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-yellow-400">
                <Star className="h-4 w-4 fill-yellow-400" />
                <span className="font-semibold">{formatRating(movie.vote_average)}</span>
                <span className="text-muted-foreground">
                  ({movie.vote_count.toLocaleString()} votes)
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
              <span className="inline-flex items-center gap-1.5 uppercase">
                <Languages className="h-4 w-4" />
                {movie.original_language}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <Badge key={g.id} variant="glass">
                  {g.name}
                </Badge>
              ))}
            </div>

            {/* Overview */}
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {movie.overview || "No overview available."}
            </p>

            {director && (
              <p className="text-sm text-muted-foreground">
                Directed by{" "}
                <span className="font-semibold text-foreground">{director.name}</span>
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/30">
                <Link href={`/watch/${movie.id}`}>
                  <Play className="h-4 w-4 fill-white" />
                  Watch Now
                </Link>
              </Button>
              <TrailerButton tmdbId={movie.id} title={movie.title} />
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href={fromCollection ? `/collection/${fromCollection}` : "/"}>
                  <ArrowLeft className="h-4 w-4" />
                  {fromCollection ? "Back to Collection" : "Back Home"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Cast */}
        {topCast.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-bold sm:text-2xl">Top Cast</h2>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {topCast.map((person, i) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
                  className="w-28 shrink-0 snap-start sm:w-32"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <Image
                      src={getImageUrl(person.profile_path, "w185")}
                      alt={person.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs font-semibold">{person.name}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {person.character}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        <RelatedMovies tmdbId={movie.id} />
      </div>
    </div>
  );
}
