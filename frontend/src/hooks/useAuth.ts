"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/lib/utils";

export function useAuth() {
  const { user, isAuthenticated, setTokens, setUser, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch current user if authenticated
  const { isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await authApi.me();
      setUser(data);
      return data;
    },
    enabled: isAuthenticated && !user,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async ({ data }) => {
      setTokens(data.access_token, data.refresh_token);
      const { data: me } = await authApi.me();
      setUser(me);
      queryClient.invalidateQueries();
      toast.success("Добро пожаловать!");
      router.push("/");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const registerMutation = useMutation({
    mutationFn: (data: {
      email: string;
      username: string;
      password: string;
      full_name?: string;
    }) => authApi.register(data),
    onSuccess: async (_, variables) => {
      const { data } = await authApi.login(variables.email, variables.password);
      setTokens(data.access_token, data.refresh_token);
      const { data: me } = await authApi.me();
      setUser(me);
      toast.success("Аккаунт создан!");
      router.push("/");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleLogout = () => {
    logout();
    queryClient.clear();
    toast.info("Вы вышли из системы");
    router.push("/");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: handleLogout,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  };
}
