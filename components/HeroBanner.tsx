"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Layers, Sparkles, Youtube } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/tmdb";

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  /** Backdrop path for the ambient background. */
  backdropPath?: string | null;
  /** Custom async backdrop node (e.g. fetches trending backdrop client-side). */
  backdropSlot?: React.ReactNode;
  /** CTA pointing at a featured collection. */
  cta?: { label: string; href: string };
  stats?: { label: string; value: string }[];
}

export function HeroBanner({
  title = "Stop scrolling.\nStart watching.",
  subtitle = "Hand-picked movie collections from the best YouTube curators — instantly enriched with posters, ratings, trailers and one-click streaming.",
  backdropPath,
  backdropSlot,
  cta,
  stats,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0" aria-hidden>
        {backdropSlot ??
          (backdropPath ? (
            <Image
              src={getImageUrl(backdropPath, "w1280")}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
          ) : null)}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-purple-600/15 blur-[140px]" />
      </div>

      <div className="container relative flex min-h-[70vh] flex-col items-center justify-center py-20 text-center sm:min-h-[78vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="glass" className="mb-6 gap-1.5 px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Curated collections · Powered by TMDB
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="max-w-4xl whitespace-pre-line text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          {title.split("\n").map((line, i) => (
            <span key={i} className={i === 1 ? "bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent" : ""}>
              {line}
              {i === 0 ? "\n" : ""}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24 }}
          className="mt-8 w-full max-w-xl"
        >
          <SearchBar />
        </motion.div>

        {cta && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" className="gap-2">
              <Link href={cta.href}>
                <Layers className="h-4 w-4" />
                {cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}

        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Youtube className="h-3 w-3" />
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
