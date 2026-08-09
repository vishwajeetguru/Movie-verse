"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Languages, MonitorPlay, RotateCcw, Server } from "lucide-react";
import {
  getAllMovieSources,
  getPreferredServer,
  savePreferredServer,
} from "@/lib/vidking";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { VidKingServer } from "@/types";

interface PlayerSectionProps {
  tmdbId: number;
  title: string;
}

const SUBTITLES = [
  { code: "off", label: "Subtitles Off" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "हिन्दी" },
];

const QUALITIES = ["auto", "1080p", "720p", "480p"] as const;

export function PlayerSection({ tmdbId, title }: PlayerSectionProps) {
  const sources = useMemo(() => getAllMovieSources(tmdbId), [tmdbId]);
  const [server, setServer] = useState<VidKingServer>("vidking");
  const [subtitle, setSubtitle] = useState("off");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]>("auto");
  const [reloadKey, setReloadKey] = useState(0);

  // Restore preferred server on mount.
  useEffect(() => {
    setServer(getPreferredServer());
  }, []);

  const active = sources.find((s) => s.server === server) ?? sources[0];

  // Build the embed URL. Subtitle preference is passed to VidKing via `sub` param.
  const embedUrl = useMemo(() => {
    let url = active.url;
    if (active.server === "vidking" && subtitle !== "off") {
      url += `&sub=${subtitle}`;
    }
    if (active.server === "vidking" && quality !== "auto") {
      url += `&quality=${quality.replace("p", "")}`;
    }
    return url;
  }, [active, subtitle, quality]);

  function switchServer(next: VidKingServer) {
    setServer(next);
    savePreferredServer(next);
  }

  return (
    <div className="space-y-4">
      {/* Player frame */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/60">
        <AnimatePresence mode="wait">
          <motion.iframe
            key={`${active.server}-${reloadKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            src={embedUrl}
            title={`Watch ${title}`}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="origin"
          />
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Server className="h-3.5 w-3.5" />
          Server
        </span>
        {sources.map((s) => (
          <Button
            key={s.server}
            size="sm"
            variant={s.server === server ? "default" : "glass"}
            onClick={() => switchServer(s.server)}
            className={cn(s.server === server && "shadow-lg shadow-primary/25")}
          >
            {s.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setReloadKey((k) => k + 1)}
          title="Reload player"
          aria-label="Reload player"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Quality selector (a hint passed to the provider where supported) */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <MonitorPlay className="h-3.5 w-3.5" />
            Quality
          </span>
          <div className="flex overflow-hidden rounded-md border border-white/10">
            {QUALITIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium uppercase transition-colors",
                  quality === q
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle selector */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Languages className="h-3.5 w-3.5" />
            Subtitles
          </span>
          <select
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="h-8 rounded-md border border-white/10 bg-white/5 px-2 text-xs text-foreground outline-none backdrop-blur-md focus:border-primary/60 [&>option]:bg-background"
            aria-label="Subtitle language"
          >
            {SUBTITLES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        If a server doesn&apos;t load, switch to another one — availability varies by
        region. Fullscreen is supported in the player controls.
      </p>
    </div>
  );
}
