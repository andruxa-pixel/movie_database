"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

const schema = z.object({
  rating: z.number().min(1).max(10),
  title: z.string().max(200).optional(),
  content: z.string().min(10, "Минимум 10 символов").max(5000, "Максимум 5000 символов"),
  is_spoiler: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface ReviewFormProps {
  initialData?: Review;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export default function ReviewForm({ initialData, onSubmit, onCancel, isPending }: ReviewFormProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: initialData?.rating || 0,
      title: initialData?.title || "",
      content: initialData?.content || "",
      is_spoiler: initialData?.is_spoiler || false,
    },
  });

  const rating = watch("rating");
  const isSpoiler = watch("is_spoiler");

  const renderStars = () => {
    const display = hoveredStar || rating;
    return Array.from({ length: 10 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-7 w-7 cursor-pointer transition-all hover:scale-110",
          i < display ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        )}
        onMouseEnter={() => setHoveredStar(i + 1)}
        onMouseLeave={() => setHoveredStar(0)}
        onClick={() => setValue("rating", i + 1, { shouldValidate: true })}
      />
    ));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Rating */}
      <div>
        <Label className="mb-2 block">Оценка *</Label>
        <div className="flex items-center gap-1">
          {renderStars()}
          {rating > 0 && (
            <span className="ml-2 text-lg font-bold text-yellow-400">{rating}/10</span>
          )}
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive mt-1">Поставьте оценку</p>
        )}
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title">Заголовок (необязательно)</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Краткое название рецензии"
          className="mt-1"
        />
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Рецензия *</Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="Напишите ваше мнение о фильме..."
          className="mt-1 min-h-[120px]"
        />
        {errors.content && (
          <p className="text-xs text-destructive mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Spoiler checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSpoiler}
          onChange={(e) => setValue("is_spoiler", e.target.checked)}
          className="rounded border-border"
        />
        <span className="text-sm text-muted-foreground">Рецензия содержит спойлеры</span>
      </label>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || rating === 0}>
          {isPending ? "Сохранение..." : initialData ? "Обновить" : "Опубликовать"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
