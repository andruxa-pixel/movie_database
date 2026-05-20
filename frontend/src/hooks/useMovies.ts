"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moviesApi } from "@/lib/api";
import type { PaginatedMovies, MovieListItem, Movie, Genre } from "@/types";

interface MovieFilters {
  query?: string;
  genre_slug?: string;
  year_from?: number;
  year_to?: number;
  rating_min?: number;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  page_size?: number;
}

export function useMovies(filters: MovieFilters = {}) {
  return useQuery<PaginatedMovies>({
    queryKey: ["movies", filters],
    queryFn: async () => {
      const { data } = await moviesApi.list(filters);
      return data;
    },
  });
}

export function useMovie(id: string) {
  return useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: async () => {
      const { data } = await moviesApi.getById(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useTopRatedMovies(limit = 10) {
  return useQuery<MovieListItem[]>({
    queryKey: ["movies", "top-rated", limit],
    queryFn: async () => {
      const { data } = await moviesApi.topRated(limit);
      return data;
    },
  });
}

export function useRecentMovies(limit = 10) {
  return useQuery<MovieListItem[]>({
    queryKey: ["movies", "recent", limit],
    queryFn: async () => {
      const { data } = await moviesApi.recent(limit);
      return data;
    },
  });
}

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data } = await moviesApi.genres();
      return data;
    },
    staleTime: Infinity,
  });
}
