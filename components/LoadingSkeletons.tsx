import { Skeleton } from "@/components/ui/skeleton";
import { MovieGridSkeleton } from "@/components/MovieGrid";
import { CollectionCardSkeleton } from "@/components/CollectionCard";

/** Movie detail page skeleton. */
export function MovieDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[45vh] w-full rounded-none sm:h-[55vh]" />
      <div className="container -mt-32 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <Skeleton className="aspect-[2/3] w-40 shrink-0 rounded-xl sm:w-56" />
          <div className="flex-1 space-y-4 sm:pt-36">
            <Skeleton className="h-9 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full max-w-2xl" />
            <Skeleton className="h-11 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Watch page skeleton. */
export function WatchPageSkeleton() {
  return (
    <div className="container space-y-6 py-6">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-16 w-full max-w-3xl" />
      </div>
    </div>
  );
}

/** Collection page skeleton. */
export function CollectionPageSkeleton() {
  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-48" />
      </div>
      <MovieGridSkeleton count={10} />
    </div>
  );
}

/** Home page section skeleton. */
export function HomeSectionSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <CollectionCardSkeleton />
      <CollectionCardSkeleton />
      <CollectionCardSkeleton />
    </div>
  );
}

export { MovieGridSkeleton };
