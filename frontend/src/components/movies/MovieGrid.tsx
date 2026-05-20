import MovieCard from "./MovieCard";
import { MovieCardSkeleton } from "@/components/common/LoadingSpinner";
import type { MovieListItem } from "@/types";

interface MovieGridProps {
  movies?: MovieListItem[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export default function MovieGrid({
  movies,
  isLoading,
  skeletonCount = 10,
  className,
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!movies?.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">Фильмы не найдены</p>
        <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
