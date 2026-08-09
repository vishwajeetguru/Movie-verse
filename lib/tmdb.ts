import type {
  TMDBCredits,
  TMDBMovie,
  TMDBMovieDetails,
  TMDBMultiResult,
  TMDBSearchResponse,
  TMDBVideosResponse,
} from "@/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? "";
const READ_ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN ?? "";

type ImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

export function getImageUrl(
  path: string | null | undefined,
  size: ImageSize = "w500"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

interface RequestOptions {
  signal?: AbortSignal;
  next?: { revalidate?: number };
}

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  options: RequestOptions = {}
): Promise<T> {
  const searchParams = new URLSearchParams();

  // Prefer Bearer token; fall back to api_key query param.
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (READ_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${READ_ACCESS_TOKEN}`;
  } else if (API_KEY) {
    searchParams.set("api_key", API_KEY);
  }

  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value));
  }

  const url = `${TMDB_BASE_URL}${endpoint}?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers,
    signal: options.signal,
    next: options.next,
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${res.statusText} (${endpoint})`);
  }

  return res.json() as Promise<T>;
}

/* ------------------------------ */
/*  Movies                        */
/* ------------------------------ */

/** Search for a movie by title. Returns the best match or null. */
export async function searchMovie(
  query: string,
  options: RequestOptions = {}
): Promise<TMDBMovie | null> {
  const data = await tmdbFetch<TMDBSearchResponse<TMDBMovie>>(
    "/search/movie",
    { query, include_adult: false, page: 1 },
    options
  );
  return data.results[0] ?? null;
}

/** Full movie search (all results, paginated). */
export async function searchMovies(
  query: string,
  page = 1,
  options: RequestOptions = {}
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>(
    "/search/movie",
    { query, include_adult: false, page },
    options
  );
}

/** Multi-search across movies, TV and people (filtered to movie/tv). */
export async function searchMulti(
  query: string,
  options: RequestOptions = {}
): Promise<TMDBMultiResult[]> {
  const data = await tmdbFetch<TMDBSearchResponse<TMDBMultiResult>>(
    "/search/multi",
    { query, include_adult: false, page: 1 },
    options
  );
  return data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv");
}

/** Get full details for a movie. */
export async function getMovieDetails(
  id: number | string,
  options: RequestOptions = {}
): Promise<TMDBMovieDetails> {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, {}, options);
}

/** Get credits (cast & crew) for a movie. */
export async function getMovieCredits(
  id: number | string,
  options: RequestOptions = {}
): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`, {}, options);
}

/** Get videos (trailers, teasers) for a movie. */
export async function getMovieVideos(
  id: number | string,
  options: RequestOptions = {}
): Promise<TMDBVideosResponse> {
  return tmdbFetch<TMDBVideosResponse>(`/movie/${id}/videos`, {}, options);
}

/** Get the best YouTube trailer key for a movie. */
export async function getMovieTrailerKey(
  id: number | string,
  options: RequestOptions = {}
): Promise<string | null> {
  try {
    const videos = await getMovieVideos(id, options);
    const youtube = videos.results.filter((v) => v.site === "YouTube");
    const trailer =
      youtube.find((v) => v.type === "Trailer" && v.official) ??
      youtube.find((v) => v.type === "Trailer") ??
      youtube.find((v) => v.type === "Teaser") ??
      youtube[0];
    return trailer?.key ?? null;
  } catch {
    return null;
  }
}

/** Get similar movies (great for "Related Movies"). */
export async function getSimilarMovies(
  id: number | string,
  options: RequestOptions = {}
): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBSearchResponse<TMDBMovie>>(
    `/movie/${id}/similar`,
    { page: 1 },
    options
  );
  return data.results;
}

/** Trending movies of the week. */
export async function getTrendingMovies(
  options: RequestOptions = {}
): Promise<TMDBMovie[]> {
  const data = await tmdbFetch<TMDBSearchResponse<TMDBMovie>>(
    "/trending/movie/week",
    {},
    options
  );
  return data.results;
}

/** Popular movies (paginated — useful for infinite scroll). */
export async function getPopularMovies(
  page = 1,
  options: RequestOptions = {}
): Promise<TMDBSearchResponse<TMDBMovie>> {
  return tmdbFetch<TMDBSearchResponse<TMDBMovie>>(
    "/movie/popular",
    { page },
    options
  );
}

/* ------------------------------ */
/*  Resolution helpers            */
/* ------------------------------ */

/**
 * Resolve a list of movie names into TMDB movies.
 * Uses `Promise.allSettled` so one failed lookup never breaks a collection.
 */
export async function resolveMovieNames(
  names: string[],
  options: RequestOptions = {}
): Promise<TMDBMovie[]> {
  const results = await Promise.allSettled(
    names.map((name) => searchMovie(name, options))
  );
  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((m): m is TMDBMovie => m !== null);
}
