"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieGrid from "@/components/movies/MovieGrid";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useWatchlist } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import type { MovieListItem } from "@/types";

const STATUSES = [
  { value: undefined, label: "Все" },
  { value: "want_to_watch", label: "Хочу посмотреть" },
  { value: "watching", label: "Смотрю" },
  { value: "watched", label: "Посмотрел" },
];

export default function WatchlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWatchlist(status, page);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <LoadingSpinner fullPage />;

  const movies: MovieListItem[] = data?.items?.map((w: any) => w.movie) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <List className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Список просмотра</h1>
          {data && <p className="text-muted-foreground text-sm">{data.total} фильмов</p>}
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Button
            key={s.label}
            variant={status === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setStatus(s.value); setPage(1); }}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : movies.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <List className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-semibold mb-2">Список пуст</h2>
          <p>Добавляйте фильмы в список просмотра на странице фильма</p>
        </div>
      ) : (
        <>
          <MovieGrid movies={movies} />
          {data?.total_pages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                page={page}
                totalPages={data.total_pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
