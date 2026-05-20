"use client";

import Link from "next/link";
import { ArrowRight, Film, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieGrid from "@/components/movies/MovieGrid";
import { Badge } from "@/components/ui/badge";
import { useTopRatedMovies, useRecentMovies, useGenres } from "@/hooks/useMovies";

export default function HomePage() {
  const { data: topRated, isLoading: loadingTop } = useTopRatedMovies(6);
  const { data: recent, isLoading: loadingRecent } = useRecentMovies(6);
  const { data: genres } = useGenres();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-card to-background py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative container mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Film className="h-4 w-4" />
            Ваш личный кинопоиск
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Откройте мир{" "}
            <span className="text-primary">великого кино</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Тысячи фильмов, честные рецензии пользователей и персональные рекомендации — всё в одном месте.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/movies">
                Смотреть каталог
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Создать аккаунт</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Rated */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <h2 className="text-xl font-bold">Лучшие фильмы</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/movies?sort_by=avg_rating&sort_order=desc">
              Все <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <MovieGrid movies={topRated} isLoading={loadingTop} skeletonCount={6} />
      </section>

      {/* Genres */}
      {genres && genres.length > 0 && (
        <section className="container mx-auto px-4 py-8 bg-card/50 rounded-2xl mx-4">
          <h2 className="text-xl font-bold mb-4">Жанры</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Link key={genre.id} href={`/movies?genre_slug=${genre.slug}`}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm px-3 py-1"
                >
                  {genre.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Новые поступления</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/movies">
              Все <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <MovieGrid movies={recent} isLoading={loadingRecent} skeletonCount={6} />
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Присоединяйтесь к сообществу</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Создайте аккаунт, ставьте оценки, пишите рецензии и ведите список просмотра.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Начать бесплатно</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
