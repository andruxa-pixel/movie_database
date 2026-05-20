"use client";

import { useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useMovieReviews, useMyMovieReview, useCreateReview, useUpdateReview, useDeleteReview } from "@/hooks/useReviews";
import { useAuthStore } from "@/store/authStore";
import type { Review } from "@/types";
import Link from "next/link";
import { PenLine } from "lucide-react";

interface ReviewListProps {
  movieId: string;
}

export default function ReviewList({ movieId }: ReviewListProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [page, setPage] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useMovieReviews(movieId, page);
  const { data: myReview } = useMyMovieReview(movieId);
  const createReview = useCreateReview(movieId);
  const updateReview = useUpdateReview(movieId);
  const deleteReview = useDeleteReview(movieId);

  const handleCreate = (formData: any) => {
    createReview.mutate(formData, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (formData: any) => {
    if (!editingReview) return;
    updateReview.mutate(
      { reviewId: editingReview.id, data: formData },
      { onSuccess: () => setEditingReview(null) }
    );
  };

  const handleDelete = (reviewId: string) => {
    if (confirm("Удалить рецензию?")) {
      deleteReview.mutate(reviewId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Рецензии {data && <span className="text-muted-foreground text-base">({data.total})</span>}
        </h2>
        {isAuthenticated && !myReview && !showForm && (
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1.5">
            <PenLine className="h-4 w-4" />
            Написать рецензию
          </Button>
        )}
      </div>

      {/* Write review form */}
      {isAuthenticated && showForm && !myReview && (
        <div className="border border-border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-4">Ваша рецензия</h3>
          <ReviewForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isPending={createReview.isPending}
          />
        </div>
      )}

      {!isAuthenticated && (
        <div className="text-center py-6 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-3">Войдите, чтобы написать рецензию</p>
          <Button asChild size="sm">
            <Link href="/login">Войти</Link>
          </Button>
        </div>
      )}

      {/* Edit form */}
      {editingReview && (
        <div className="border border-border rounded-lg p-4 bg-card">
          <h3 className="font-semibold mb-4">Редактировать рецензию</h3>
          <ReviewForm
            initialData={editingReview}
            onSubmit={handleUpdate}
            onCancel={() => setEditingReview(null)}
            isPending={updateReview.isPending}
          />
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Рецензий пока нет. Будьте первым!
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={setEditingReview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            page={page}
            totalPages={data.total_pages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
