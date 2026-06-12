import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md">
        <Award className="h-16 w-16 text-gold mx-auto" />
        <div>
          <h1 className="text-6xl font-bold text-navy">404</h1>
          <h2 className="text-xl font-semibold mt-2">Page not found</h2>
          <p className="text-muted-foreground mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Shop Awards</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
