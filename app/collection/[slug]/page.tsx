import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllCollectionSlugs, getCollectionBySlug } from "@/lib/collections";
import { CollectionClient } from "./CollectionClient";

export const revalidate = 3600;

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllCollectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return { title: "Collection not found" };

  const description = `${collection.title} — a curated list of ${collection.movies.length} movies with ratings, trailers, cast and one-click streaming.`;

  return {
    title: collection.title,
    description,
    openGraph: {
      title: collection.title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: collection.title,
      description,
    },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) notFound();

  return <CollectionClient collection={collection} />;
}
