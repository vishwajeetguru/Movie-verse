import type { Metadata } from "next";
import { WatchClient } from "./WatchClient";

interface WatchPageProps {
  params: Promise<{ tmdbId: string }>;
}

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { tmdbId } = await params;
  return {
    title: `Watch Movie #${tmdbId}`,
    description: "Stream this movie instantly on MovieVerse with multiple servers, subtitles and quality controls.",
    robots: { index: false, follow: true },
  };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { tmdbId } = await params;
  return <WatchClient tmdbId={Number(tmdbId)} />;
}
