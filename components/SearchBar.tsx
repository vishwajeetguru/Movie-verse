"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, Layers, Loader2, Search, Star, Tv, X } from "lucide-react";
import { getImageUrl } from "@/lib/tmdb";
import { cn, formatRating } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSearchSuggestions } from "@/hooks/useSearchSuggestions";
import type { SearchSuggestion } from "@/types";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function SearchBar({
  placeholder = "Search movies, series, collections...",
  autoFocus = false,
  className,
  onNavigate,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useSearchSuggestions(query);

  // Close dropdown on outside click.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function navigateTo(s: SearchSuggestion) {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    if (s.type === "collection" && s.slug) {
      router.push(`/collection/${s.slug}`);
    } else if (s.type === "movie") {
      router.push(`/movie/${s.id}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(s.title)}`);
    }
  }

  function submitSearch() {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigateTo(suggestions[activeIndex]);
      } else {
        submitSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-12 rounded-full border-white/15 bg-white/5 pl-11 pr-10 text-sm backdrop-blur-md placeholder:text-muted-foreground/70 focus-visible:ring-primary/60"
          aria-label="Search"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : isLoading ? (
          <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <AnimatePresence>
        {open && query.trim().length >= 2 && (
          <motion.div
            id="search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-background/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
          >
            {suggestions.length === 0 && !isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;. Press Enter to search everything.
              </div>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto py-2">
                {suggestions.map((s, i) => (
                  <li key={`${s.type}-${s.id}-${s.slug ?? i}`}>
                    <button
                      role="option"
                      aria-selected={i === activeIndex}
                      onClick={() => navigateTo(s)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        i === activeIndex ? "bg-white/10" : "bg-transparent"
                      )}
                    >
                      {s.type === "collection" ? (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                          <Layers className="h-5 w-5" />
                        </span>
                      ) : (
                        <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/5">
                          <Image
                            src={getImageUrl(s.posterPath ?? null, "w92")}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {s.title}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          {s.type === "collection" && (
                            <span className="inline-flex items-center gap-1">
                              <Layers className="h-3 w-3" /> Collection
                            </span>
                          )}
                          {s.type === "movie" && (
                            <span className="inline-flex items-center gap-1">
                              <Clapperboard className="h-3 w-3" /> Movie
                            </span>
                          )}
                          {s.type === "tv" && (
                            <span className="inline-flex items-center gap-1">
                              <Tv className="h-3 w-3" /> Series
                            </span>
                          )}
                          {s.year && <span>{s.year}</span>}
                          {typeof s.rating === "number" && s.rating > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-yellow-400">
                              <Star className="h-3 w-3 fill-yellow-400" />
                              {formatRating(s.rating)}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={submitSearch}
              className="block w-full border-t border-white/10 bg-white/5 px-4 py-2.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            >
              See all results for &ldquo;{query}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
