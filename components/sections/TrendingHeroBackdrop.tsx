"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getImageUrl, getTrendingMovies } from "@/lib/tmdb";

/** Slowly cross-fades through backdrops of this week's trending movies. */
export function TrendingHeroBackdrop() {
  const [backdrops, setBackdrops] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getTrendingMovies({ signal: controller.signal })
      .then((movies) => {
        if (controller.signal.aborted) return;
        const paths = movies
          .map((m) => m.backdrop_path)
          .filter((p): p is string => Boolean(p))
          .slice(0, 6);
        setBackdrops(paths);
      })
      .catch(() => {
        /* ambience is optional */
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (backdrops.length < 2) return;
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % backdrops.length),
      7000
    );
    return () => clearInterval(interval);
  }, [backdrops.length]);

  if (backdrops.length === 0) return null;

  return (
    <div className="absolute inset-0">
      {backdrops.map((path, i) => (
        <motion.div
          key={path}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 0.3 : 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          <Image
            src={getImageUrl(path, "w1280")}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
