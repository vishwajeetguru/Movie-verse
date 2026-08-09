import Link from "next/link";
import { Clapperboard } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background/60">
      <div className="container flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600">
            <Clapperboard className="h-4 w-4 text-white" />
          </span>
          <span className="text-sm font-bold">
            Movie<span className="text-primary">Verse</span>
          </span>
        </div>

        <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
          Movie data and images provided by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-foreground"
          >
            TMDB
          </a>
          . Streaming playback via embedded third-party players. This product uses
          the TMDB API but is not endorsed or certified by TMDB.
        </p>

        <nav className="flex items-center gap-4 text-xs text-muted-foreground" aria-label="Footer">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/search" className="transition-colors hover:text-foreground">
            Browse
          </Link>
        </nav>
      </div>
    </footer>
  );
}
