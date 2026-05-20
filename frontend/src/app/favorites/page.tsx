"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import MovieGrid from "@/components/movies/MovieGrid";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import type { MovieListItem } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFavorites(page);

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <LoadingSpinner fullPage />;

  const movies: MovieListItem[] = data?.items?.map((f: any) => f.movie) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-7 w-7 text-red-500 fill-red-500" />
        <div>
          <h1 className="text-3xl font-bold">Избранное</h1>
          {data && (
            <p className="text-muted-foreground text-sm">{data.total} фильмов</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner fullPage />
      ) : movies.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-semibold mb-2">Список пуст</h2>
          <p>Добавляйте фильмы в избранное, нажимая на ♥ на карточке фильма</p>
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
