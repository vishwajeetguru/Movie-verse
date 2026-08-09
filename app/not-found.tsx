import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
        <Compass className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold">404 — Lost in the Verse</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for wasn&apos;t found. It may have been moved,
          or the collection slug doesn&apos;t exist.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Back Home</Link>
        </Button>
        <Button asChild variant="glass">
          <Link href="/search">Browse Movies</Link>
        </Button>
      </div>
    </div>
  );
}
