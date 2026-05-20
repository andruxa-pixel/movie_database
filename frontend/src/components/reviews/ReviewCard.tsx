"use client";

import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import RatingStars, { RatingBadge } from "@/components/common/RatingStars";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
}

export default function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const user = useAuthStore((s) => s.user);
  const isOwner = user?.id === review.user_id;
  const isAdmin = user?.is_admin;

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {review.user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm">{review.user.full_name || review.user.username}</p>
            <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RatingBadge rating={review.rating} size="sm" />
          {(isOwner || isAdmin) && (
            <div className="flex gap-1">
              {isOwner && onEdit && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(review)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {(isOwner || isAdmin) && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDelete(review.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stars */}
      <RatingStars rating={review.rating} size="sm" />

      {/* Spoiler warning */}
      {review.is_spoiler && (
        <Badge variant="destructive" className="gap-1 text-xs">
          <AlertTriangle className="h-3 w-3" /> Содержит спойлеры
        </Badge>
      )}

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-sm">{review.title}</h4>
      )}

      {/* Content */}
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {review.content}
      </p>
    </div>
  );
}
