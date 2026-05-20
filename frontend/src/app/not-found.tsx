import Link from "next/link";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
      <Film className="h-20 w-20 text-muted-foreground opacity-40" />
      <div>
        <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Страница не найдена</h2>
        <p className="text-muted-foreground">Эта страница была удалена или никогда не существовала</p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">На главную</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/movies">Фильмы</Link>
        </Button>
      </div>
    </div>
  );
}
