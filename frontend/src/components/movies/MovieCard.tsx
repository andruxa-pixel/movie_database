"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Clock, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingBadge } from "@/components/common/RatingStars";
import { useIsFavorited, useToggleFavorite } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { formatDuration, cn } from "@/lib/utils";
import type { MovieListItem } from "@/types";

interface MovieCardProps {
  movie: MovieListItem;
  className?: string;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: favData } = useIsFavorited(movie.id);
  const { add, remove, isPending } = useToggleFavorite(movie.id);
  const [imgError, setImgError] = useState(false);

  const isFavorited = favData?.is_favorited ?? false;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) remove();
    else add();
  };

  const showPoster = movie.poster_url && !imgError;

  return (
    <Link href={`/movies/${movie.id}`} className={cn("group block", className)}>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-secondary">

        {/* Постер или плейсхолдер */}
        {showPoster ? (
          <Image
            src={movie.poster_url!}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground p-2">
            <Film className="h-10 w-10 opacity-30" />
            <span className="text-xs text-center opacity-60 line-clamp-2">{movie.title}</span>
          </div>
        )}

        {/* Оценка */}
        {movie.ratings_count > 0 && (
          <div className="absolute top-2 left-2">
            <RatingBadge rating={movie.avg_rating} size="sm" />
          </div>
        )}

        {/* Кнопка избранного */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full transition-all",
              "opacity-0 group-hover:opacity-100",
              isFavorited
                ? "opacity-100 bg-black/60 text-red-500"
                : "bg-black/60 text-white hover:text-red-400"
            )}
            onClick={handleFavorite}
            disabled={isPending}
          >
            <Heart className={cn("h-4 w-4", isFavorited && "fill-red-500")} />
          </Button>
        )}

        {/* Затемнение при ховере */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Подпись */}
      <div className="mt-2 space-y-1">
        <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {movie.release_year && <span>{movie.release_year}</span>}
          {movie.duration && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {formatDuration(movie.duration)}
            </span>
          )}
        </div>
        {movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 2).map((g) => (
              <Badge key={g.id} variant="secondary" className="text-xs px-1.5 py-0">
                {g.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
