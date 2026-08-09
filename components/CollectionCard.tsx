"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, Layers, Youtube } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollectionPreviews } from "@/hooks/useCollectionMovies";
import type { CollectionMeta } from "@/types";

interface CollectionCardProps {
  collection: CollectionMeta;
  /** Movie names used to fetch preview posters. */
  movieNames: string[];
  featured?: boolean;
}

export function CollectionCard({
  collection,
  movieNames,
  featured = false,
}: CollectionCardProps) {
  const { posters, isLoading } = useCollectionPreviews(movieNames, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link
        href={`/collection/${collection.slug}`}
        aria-label={collection.title}
        className="block"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-colors duration-300 group-hover:border-primary/40">
          {/* Poster fan */}
          <div className="relative flex h-44 items-end gap-2 overflow-hidden p-3 sm:h-52">
            {/* Ambient backdrop from first poster */}
            {posters[0] && (
              <Image
                src={getImageUrl(posters[0], "w500")}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-25 blur-md scale-110"
                aria-hidden
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="relative aspect-[2/3] w-1/4 rounded-lg"
                  />
                ))
              : posters.slice(0, 4).map((poster, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14, rotate: (i - 1.5) * 3 }}
                    animate={{ opacity: 1, y: 0, rotate: (i - 1.5) * 3 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="relative aspect-[2/3] w-1/4 overflow-hidden rounded-lg border border-white/10 shadow-lg shadow-black/50"
                  >
                    <Image
                      src={getImageUrl(poster, "w185")}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                      aria-hidden
                    />
                  </motion.div>
                ))}

            {featured && (
              <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>

          {/* Body */}
          <div className="relative space-y-2 p-4">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-lg">
              {collection.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clapperboard className="h-3.5 w-3.5" />
                {collection.totalMovies} movies
              </span>
              {collection.youtubeUrl && (
                <span className="inline-flex items-center gap-1.5 text-red-400">
                  <Youtube className="h-3.5 w-3.5" />
                  Video list
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Collection
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CollectionCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <Skeleton className="h-44 rounded-none sm:h-52" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
    </div>
  );
}
