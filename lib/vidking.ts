import type { VidKingServer, WatchSource } from "@/types";

/**
 * VidKing (and compatible) embed providers.
 * These are client-side iframe embeds keyed by TMDB ID.
 */

const PROVIDERS: Record<VidKingServer, { label: string; movie: (id: number | string, tmdbId?: number | string) => string; tv: (id: number | string, season?: number, episode?: number) => string }> = {
  vidking: {
    label: "VidKing",
    movie: (id) =>
      `https://www.vidking.net/embed/movie/${id}?autoPlay=true&nextEpisode=true&episodeSelector=true`,
    tv: (id, season = 1, episode = 1) =>
      `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?autoPlay=true&nextEpisode=true&episodeSelector=true`,
  },
  vidsrc: {
    label: "VidSrc",
    movie: (id) => `https://vidsrc.xyz/embed/movie?tmdb=${id}`,
    tv: (id, season = 1, episode = 1) =>
      `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  embedsu: {
    label: "EmbedSu",
    movie: (id) => `https://embed.su/embed/movie/${id}`,
    tv: (id, season = 1, episode = 1) =>
      `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  },
};

export const SERVER_ORDER: VidKingServer[] = ["vidking", "vidsrc", "embedsu"];

const STORAGE_KEY = "movieverse:preferred-server";

/** Get a movie watch source from a specific server. */
export function getMovieSource(
  tmdbId: number | string,
  server: VidKingServer = "vidking"
): WatchSource {
  const provider = PROVIDERS[server];
  return {
    server,
    label: provider.label,
    url: provider.movie(tmdbId),
  };
}

/** Get all available movie watch sources for server-selection UI. */
export function getAllMovieSources(tmdbId: number | string): WatchSource[] {
  return SERVER_ORDER.map((server) => getMovieSource(tmdbId, server));
}

/** Get a TV series source (defaults to S01E01). */
export function getSeriesSource(
  tmdbId: number | string,
  season = 1,
  episode = 1,
  server: VidKingServer = "vidking"
): WatchSource {
  const provider = PROVIDERS[server];
  return {
    server,
    label: provider.label,
    url: provider.tv(tmdbId, season, episode),
  };
}

/** Build an episode list (client-side helper for series). */
export function getEpisodes(
  tmdbId: number | string,
  season: number,
  episodeCount: number,
  server: VidKingServer = "vidking"
): WatchSource[] {
  return Array.from({ length: episodeCount }, (_, i) =>
    getSeriesSource(tmdbId, season, i + 1, server)
  );
}

/** Persist the user's preferred server (localStorage). */
export function savePreferredServer(server: VidKingServer): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, server);
  } catch {
    /* no-op */
  }
}

/** Read the user's preferred server (defaults to VidKing). */
export function getPreferredServer(): VidKingServer {
  if (typeof window === "undefined") return "vidking";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SERVER_ORDER.includes(saved as VidKingServer)) {
      return saved as VidKingServer;
    }
  } catch {
    /* no-op */
  }
  return "vidking";
}
