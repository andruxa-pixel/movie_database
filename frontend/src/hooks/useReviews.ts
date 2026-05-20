"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewsApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import type { PaginatedReviews, Review } from "@/types";

export function useMovieReviews(movieId: string, page = 1, pageSize = 10) {
  return useQuery<PaginatedReviews>({
    queryKey: ["reviews", "movie", movieId, page, pageSize],
    queryFn: async () => {
      const { data } = await reviewsApi.getByMovie(movieId, { page, page_size: pageSize });
      return data;
    },
    enabled: !!movieId,
  });
}

export function useUserReviews(userId: string, page = 1) {
  return useQuery<PaginatedReviews>({
    queryKey: ["reviews", "user", userId, page],
    queryFn: async () => {
      const { data } = await reviewsApi.getByUser(userId, { page });
      return data;
    },
    enabled: !!userId,
  });
}

export function useMyMovieReview(movieId: string) {
  return useQuery<Review | null>({
    queryKey: ["review", "my", movieId],
    queryFn: async () => {
      try {
        const { data } = await reviewsApi.getMyReview(movieId);
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!movieId,
  });
}

export function useCreateReview(movieId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      rating: number;
      content: string;
      title?: string;
      is_spoiler?: boolean;
    }) => reviewsApi.create(movieId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "movie", movieId] });
      queryClient.invalidateQueries({ queryKey: ["review", "my", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
      toast.success("Рецензия добавлена!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateReview(movieId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: any }) =>
      reviewsApi.update(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "movie", movieId] });
      queryClient.invalidateQueries({ queryKey: ["review", "my", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
      toast.success("Рецензия обновлена!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteReview(movieId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "movie", movieId] });
      queryClient.invalidateQueries({ queryKey: ["review", "my", movieId] });
      queryClient.invalidateQueries({ queryKey: ["movie", movieId] });
      toast.success("Рецензия удалена");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
