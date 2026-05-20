"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { moviesApi } from "@/lib/api";
import { useGenres } from "@/hooks/useMovies";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

const movieSchema = z.object({
  title: z.string().min(1, "Обязательное поле").max(300),
  original_title: z.string().max(300).optional(),
  description: z.string().optional(),
  release_year: z.coerce.number().min(1888).max(2100).optional(),
  duration: z.coerce.number().min(1).optional(),
  poster_url: z.string().url("Введите URL").optional().or(z.literal("")),
  backdrop_url: z.string().url("Введите URL").optional().or(z.literal("")),
  trailer_url: z.string().url("Введите URL").optional().or(z.literal("")),
  country: z.string().max(100).optional(),
  language: z.string().max(100).optional(),
  age_rating: z.string().max(20).optional(),
  status: z.enum(["released", "upcoming", "announced"]).default("released"),
  budget: z.coerce.number().optional(),
  box_office: z.coerce.number().optional(),
});

type MovieForm = z.infer<typeof movieSchema>;

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: genres } = useGenres();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    if (!isAuthenticated || (user && !user.is_admin)) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MovieForm>({
    resolver: zodResolver(movieSchema),
    defaultValues: { status: "released" },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => moviesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      toast.success("Фильм добавлен!");
      reset();
      setSelectedGenres([]);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit = (data: MovieForm) => {
    createMutation.mutate({
      ...data,
      genre_ids: selectedGenres,
    });
  };

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  if (!isAuthenticated || !user?.is_admin) return <LoadingSpinner fullPage />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Администрирование</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить фильм
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Название *</Label>
                <Input id="title" {...register("title")} className="mt-1" />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div className="col-span-2">
                <Label htmlFor="original_title">Оригинальное название</Label>
                <Input id="original_title" {...register("original_title")} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" {...register("description")} className="mt-1 min-h-[100px]" />
              </div>
              <div>
                <Label htmlFor="release_year">Год</Label>
                <Input id="release_year" type="number" {...register("release_year")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="duration">Длительность (мин)</Label>
                <Input id="duration" type="number" {...register("duration")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="country">Страна</Label>
                <Input id="country" {...register("country")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="language">Язык</Label>
                <Input id="language" {...register("language")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="age_rating">Возраст</Label>
                <Input id="age_rating" {...register("age_rating")} placeholder="PG-13, R, 18+" className="mt-1" />
              </div>
              <div>
                <Label>Статус</Label>
                <select
                  {...register("status")}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="released">Вышел</option>
                  <option value="upcoming">Скоро</option>
                  <option value="announced">Анонсирован</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="poster_url">URL постера</Label>
                <Input id="poster_url" {...register("poster_url")} placeholder="https://..." className="mt-1" />
                {errors.poster_url && <p className="text-xs text-destructive mt-1">{errors.poster_url.message}</p>}
              </div>
              <div className="col-span-2">
                <Label htmlFor="backdrop_url">URL обложки (backdrop)</Label>
                <Input id="backdrop_url" {...register("backdrop_url")} placeholder="https://..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="trailer_url">URL трейлера</Label>
                <Input id="trailer_url" {...register("trailer_url")} placeholder="https://youtube.com/..." className="mt-1" />
              </div>
              <div>
                <Label>Бюджет ($)</Label>
                <Input type="number" {...register("budget")} className="mt-1" />
              </div>
              <div>
                <Label>Сборы ($)</Label>
                <Input type="number" {...register("box_office")} className="mt-1" />
              </div>
            </div>

            {/* Genres */}
            {genres && (
              <div>
                <Label>Жанры</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.id)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedGenres.includes(g.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-accent"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Добавление..." : "Добавить фильм"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
