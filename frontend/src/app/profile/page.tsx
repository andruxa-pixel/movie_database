"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Film, Heart, List, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReviewCard from "@/components/reviews/ReviewCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, reviewsApi } from "@/lib/api";
import { getErrorMessage, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const profileSchema = z.object({
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url("Введите корректный URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const { data: stats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const { data } = await usersApi.myStats();
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: reviews } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await reviewsApi.getByUser(user.id, { page: 1, page_size: 5 });
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.updateMe(data),
    onSuccess: ({ data }) => {
      useAuthStore.getState().setUser(data);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Профиль обновлён");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      bio: user?.bio || "",
      avatar_url: user?.avatar_url || "",
    },
  });

  if (!isAuthenticated || !user) return <LoadingSpinner fullPage />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Avatar */}
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mx-auto mb-4">
                {user.username[0].toUpperCase()}
              </div>
              <h2 className="font-bold text-lg">{user.full_name || user.username}</h2>
              <p className="text-muted-foreground text-sm">@{user.username}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              {user.is_admin && (
                <Badge className="mt-2 bg-primary/20 text-primary">Администратор</Badge>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                На сайте с {formatDate(user.created_at)}
              </p>
            </CardContent>
          </Card>

          {/* Stats */}
          {stats && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PenLine className="h-4 w-4" /> Рецензий
                  </div>
                  <span className="font-semibold">{stats.reviews_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" /> Избранных
                  </div>
                  <span className="font-semibold">{stats.favorites_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <List className="h-4 w-4" /> В списке
                  </div>
                  <span className="font-semibold">{stats.watchlist_count}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit profile */}
          <Card>
            <CardHeader>
              <CardTitle>Редактировать профиль</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Имя</Label>
                  <Input id="full_name" {...register("full_name")} placeholder="Ваше имя" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea id="bio" {...register("bio")} placeholder="Расскажите о своих кинопредпочтениях..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="avatar_url">URL аватара</Label>
                  <Input id="avatar_url" {...register("avatar_url")} placeholder="https://..." className="mt-1" />
                  {errors.avatar_url && (
                    <p className="text-xs text-destructive mt-1">{errors.avatar_url.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent reviews */}
          {reviews && reviews.items.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Последние рецензии</h2>
              <div className="space-y-3">
                {reviews.items.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
