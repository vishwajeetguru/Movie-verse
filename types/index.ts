/* ---------------------------------- */
/*  Collection (local JSON) types     */
/* ---------------------------------- */

export interface Collection {
  title: string;
  youtubeUrl?: string;
  movies: string[];
}

export interface CollectionMeta {
  slug: string;
  title: string;
  youtubeUrl?: string;
  totalMovies: number;
  /** Poster paths of the first few resolved movies (client-filled) */
  previewPosters?: string[];
}

/* ---------------------------------- */
/*  TMDB types                        */
/* ---------------------------------- */

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  media_type?: string;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genres: TMDBGenre[];
  status: string;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdb_id: string | null;
  original_language: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCast[];
  crew: TMDBCrew[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMultiResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
}

/* ---------------------------------- */
/*  VidKing types                     */
/* ---------------------------------- */

export type VidKingServer = "vidking" | "vidsrc" | "embedsu";

export interface WatchSource {
  server: VidKingServer;
  label: string;
  url: string;
}

/* ---------------------------------- */
/*  UI types                          */
/* ---------------------------------- */

export interface SearchSuggestion {
  id: number;
  type: "movie" | "tv" | "collection";
  title: string;
  subtitle?: string;
  posterPath?: string | null;
  slug?: string;
  year?: string;
  rating?: number;
}
