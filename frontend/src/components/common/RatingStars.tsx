"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export default function RatingStars({
  rating,
  maxRating = 10,
  size = "md",
  interactive = false,
  onRate,
  className,
}: RatingStarsProps) {
  const [hovered, setHovered] = useState(0);
  const stars = 5;
  const normalizedRating = (rating / maxRating) * stars;
  const displayRating = interactive && hovered ? hovered : normalizedRating;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: stars }, (_, i) => {
        const filled = displayRating >= i + 1;
        const halfFilled = !filled && displayRating > i;
        return (
          <Star
            key={i}
            className={cn(
              sizeMap[size],
              "transition-colors",
              filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
              halfFilled && "fill-yellow-400/50 text-yellow-400",
              interactive && "cursor-pointer hover:scale-110"
            )}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onRate?.((i + 1) * 2)}
          />
        );
      })}
    </div>
  );
}

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingBadge({ rating, size = "md", className }: RatingBadgeProps) {
  const color =
    rating >= 8 ? "bg-green-500" : rating >= 6 ? "bg-yellow-500" : rating >= 4 ? "bg-orange-500" : "bg-red-500";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const padding = size === "sm" ? "px-1.5 py-0.5" : size === "lg" ? "px-3 py-1.5" : "px-2 py-1";

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded",
        color,
        textSize,
        padding,
        "text-white",
        className
      )}
    >
      ★ {rating.toFixed(1)}
    </span>
  );
}
