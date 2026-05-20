import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}м`;
  if (m === 0) return `${h}ч`;
  return `${h}ч ${m}м`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatMoney(amount: number | null): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ratingColor(rating: number): string {
  if (rating >= 8) return "text-green-400";
  if (rating >= 6) return "text-yellow-400";
  if (rating >= 4) return "text-orange-400";
  return "text-red-400";
}

export function ratingBgColor(rating: number): string {
  if (rating >= 8) return "bg-green-500";
  if (rating >= 6) return "bg-yellow-500";
  if (rating >= 4) return "bg-orange-500";
  return "bg-red-500";
}

export function getErrorMessage(error: unknown): string {
  if (!error) return "Неизвестная ошибка";
  const err = error as any;
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(", ");
  return "Произошла ошибка";
}
