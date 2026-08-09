import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./SearchClient";
import { MovieGridSkeleton } from "@/components/MovieGrid";

export const metadata: Metadata = {
  title: "Search & Browse",
  description:
    "Search movies, series and curated collections. Browse trending and popular titles with infinite scroll.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-10"><MovieGridSkeleton /></div>}>
      <SearchClient />
    </Suspense>
  );
}
