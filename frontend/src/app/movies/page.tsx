"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieGrid from "@/components/movies/MovieGrid";
import MovieSearch from "@/components/movies/MovieSearch";
import MovieFilters from "@/components/movies/MovieFilters";
import Pagination from "@/components/common/Pagination";
import { useMovies } from "@/hooks/useMovies";

interface Filters {
  query?: string;
  genre_slug?: string;
  year_from?: number;
  year_to?: number;
  rating_min?: number;
  sort_by?: string;
  sort_order?: string;
}

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    query: searchParams.get("query") || undefined,
    genre_slug: searchParams.get("genre_slug") || undefined,
    sort_by: searchParams.get("sort_by") || "created_at",
    sort_order: searchParams.get("sort_order") || "desc",
  });
  const [searchValue, setSearchValue] = useState(filters.query || "");

  // Sync with URL query params
  useEffect(() => {
    const q = searchParams.get("query");
    const gs = searchParams.get("genre_slug");
    const sb = searchParams.get("sort_by");
    const so = searchParams.get("sort_order");
    setFilters({
      query: q || undefined,
      genre_slug: gs || undefined,
      sort_by: sb || "created_at",
      sort_order: so || "desc",
    });
    if (q) setSearchValue(q);
  }, [searchParams]);

  const { data, isLoading } = useMovies({ ...filters, page, page_size: 20 });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const newFilters = { ...filters, query: value || undefined };
    setFilters(newFilters);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Каталог фильмов</h1>
        {data && (
          <p className="text-muted-foreground">
            Найдено фильмов: <span className="text-foreground font-medium">{data.total}</span>
          </p>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 max-w-lg">
        <MovieSearch value={searchValue} onChange={handleSearchChange} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <MovieFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      {/* Grid */}
      <MovieGrid movies={data?.items} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
