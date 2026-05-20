"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Film,
  Globe,
  Heart,
  List,
  Play,
  Star,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/common/RatingStars";
import ReviewList from "@/components/reviews/ReviewList";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useMovie } from "@/hooks/useMovies";
import { useIsFavorited, useToggleFavorite, useToggleWatchlist } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { formatDuration, formatMoney, formatDate, cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MovieDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: movie, isLoading } = useMovie(id);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: favData } = useIsFavorited(id);
  const { add, remove, isPending: favPending } = useToggleFavorite(id);
  const watchlistMutation = useToggleWatchlist(id);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!movie) return (
    <div className="text-center py-20 text-muted-foreground">
      Фильм не найден
    </div>
  );

  const isFavorited = favData?.is_favorited ?? false;

  return (
    <div>
      {/* Backdrop */}
      {movie.backdrop_url && !backdropError && (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <Image
            src={movie.backdrop_url}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            onError={() => setBackdropError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0">
            <div className="relative w-full max-w-[220px] mx-auto md:mx-0 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              {movie.poster_url && !posterError ? (
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                  onError={() => setPosterError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary">
                  <Film className="h-16 w-16 text-muted-foreground opacity-40" />
                  <span className="text-xs text-muted-foreground text-center px-2">{movie.title}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {isAuthenticated && (
              <div className="mt-4 space-y-2 max-w-[220px] mx-auto md:mx-0">
                <Button
                  className={cn("w-full gap-2", isFavorited && "bg-red-600 hover:bg-red-700")}
                  variant={isFavorited ? "default" : "outline"}
                  onClick={() => (isFavorited ? remove() : add())}
                  disabled={favPending}
                >
                  <Heart className={cn("h-4 w-4", isFavorited && "fill-white")} />
                  {isFavorited ? "В избранном" : "В избранное"}
                </Button>
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => watchlistMutation.mutate("want_to_watch")}
                  disabled={watchlistMutation.isPending}
                >
                  <List className="h-4 w-4" />
                  Буду смотреть
                </Button>
                {movie.trailer_url && (
                  <Button className="w-full gap-2" asChild>
                    <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4" />
                      Трейлер
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold leading-tight mb-1">{movie.title}</h1>
              {movie.original_title && movie.original_title !== movie.title && (
                <p className="text-muted-foreground text-lg">{movie.original_title}</p>
              )}
            </div>

            {/* Rating */}
            {movie.ratings_count > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <RatingBadge rating={movie.avg_rating} size="lg" />
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{movie.ratings_count.toLocaleString()} оценок</span>
                </div>
              </div>
            )}

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <Link key={g.id} href={`/movies?genre_slug=${g.slug}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                      {g.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {movie.release_year && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{movie.release_year}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{formatDuration(movie.duration)}</span>
                </div>
              )}
              {movie.country && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{movie.country}</span>
                </div>
              )}
              {movie.age_rating && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="border border-muted-foreground rounded px-1 text-muted-foreground text-xs font-medium">
                    {movie.age_rating}
                  </span>
                </div>
              )}
              {movie.budget && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Бюджет:</span>
                  <span>{formatMoney(movie.budget)}</span>
                </div>
              )}
              {movie.box_office && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Сборы:</span>
                  <span>{formatMoney(movie.box_office)}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {movie.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">{movie.description}</p>
              </div>
            )}

            {/* No account CTA */}
            {!isAuthenticated && (
              <div className="bg-card border border-border rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Войдите, чтобы добавить в избранное и написать рецензию
                </p>
                <div className="flex gap-2">
                  <Button size="sm" asChild><Link href="/login">Войти</Link></Button>
                  <Button size="sm" variant="outline" asChild><Link href="/register">Регистрация</Link></Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12 max-w-3xl">
          <ReviewList movieId={id} />
        </div>
      </div>
    </div>
  );
}
