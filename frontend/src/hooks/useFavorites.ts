"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { favoritesApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function useFavorites(page = 1) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["favorites", page],
    queryFn: async () => {
      const { data } = await favoritesApi.list({ page });
      return data;
    },
    enabled: isAuthenticated,
  });
}

export function useIsFavorited(movieId: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<{ is_favorited: boolean }>({
    queryKey: ["favorite-check", movieId],
    queryFn: async () => {
      const { data } = await favoritesApi.check(movieId);
      return data;
    },
    enabled: isAuthenticated && !!movieId,
  });
}

export function useToggleFavorite(movieId: string) {
  const queryClient = useQueryClient();
  const addMutation = useMutation({
    mutationFn: () => favoritesApi.add(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-check", movieId] });
      toast.success("Добавлено в избранное");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: () => favoritesApi.remove(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-check", movieId] });
      toast.success("Удалено из избранного");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return { add: addMutation.mutate, remove: removeMutation.mutate, isPending: addMutation.isPending || removeMutation.isPending };
}

export function useWatchlist(status?: string, page = 1) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["watchlist", status, page],
    queryFn: async () => {
      const { data } = await favoritesApi.watchlist({ status, page });
      return data;
    },
    enabled: isAuthenticated,
  });
}

export function useToggleWatchlist(movieId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => favoritesApi.addToWatchlist(movieId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Список просмотра обновлён");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
