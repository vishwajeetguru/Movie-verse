import type { Metadata } from "next";
import { MovieDetailClient } from "./MovieDetailClient";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Movie #${id}`,
    description: "View movie details, cast, trailer and streaming options on MovieVerse.",
    robots: { index: false, follow: true }, // Refined client-side once data loads.
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const tmdbId = Number(id);
  return <MovieDetailClient tmdbId={tmdbId} />;
}
