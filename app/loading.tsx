import { MovieGridSkeleton } from "@/components/MovieGrid";

export default function Loading() {
  return (
    <div className="container space-y-8 py-10">
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
      </div>
      <MovieGridSkeleton />
    </div>
  );
}
