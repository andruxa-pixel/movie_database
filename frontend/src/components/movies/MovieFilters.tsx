"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useGenres } from "@/hooks/useMovies";
import { X } from "lucide-react";

interface Filters {
  genre_slug?: string;
  year_from?: number;
  year_to?: number;
  rating_min?: number;
  sort_by?: string;
  sort_order?: string;
}

interface MovieFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const EMPTY = "__all__"; // Radix не разрешает value=""
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - i);

const SORT_OPTIONS = [
  { label: "По новизне",           value: "created_at-desc"   },
  { label: "По рейтингу (убыв)",   value: "avg_rating-desc"   },
  { label: "По рейтингу (возр)",   value: "avg_rating-asc"    },
  { label: "По году (убыв)",       value: "release_year-desc" },
  { label: "По году (возр)",       value: "release_year-asc"  },
  { label: "По названию",          value: "title-asc"         },
];

export default function MovieFilters({ filters, onChange }: MovieFiltersProps) {
  const { data: genres } = useGenres();

  // Хелпер: EMPTY → undefined, иначе оставить значение
  const val = (v: string) => (v === EMPTY ? undefined : v);

  const update = (key: keyof Filters, raw: string) => {
    const value = val(raw);
    onChange({ ...filters, [key]: value });
  };

  const clear = () => onChange({});
  const hasFilters = Object.values(filters).some(Boolean);
  const sortValue = `${filters.sort_by || "created_at"}-${filters.sort_order || "desc"}`;

  return (
    <div className="flex flex-wrap gap-2">
      {/* Жанр */}
      <Select
        value={filters.genre_slug ?? EMPTY}
        onValueChange={(v) => update("genre_slug", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Жанр" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>Все жанры</SelectItem>
          {genres?.map((g) => (
            <SelectItem key={g.id} value={g.slug}>{g.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Год от */}
      <Select
        value={filters.year_from?.toString() ?? EMPTY}
        onValueChange={(v) => onChange({ ...filters, year_from: val(v) ? parseInt(v) : undefined })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Год от" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>Любой</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Год до */}
      <Select
        value={filters.year_to?.toString() ?? EMPTY}
        onValueChange={(v) => onChange({ ...filters, year_to: val(v) ? parseInt(v) : undefined })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Год до" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>Любой</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Мин. рейтинг */}
      <Select
        value={filters.rating_min?.toString() ?? EMPTY}
        onValueChange={(v) => onChange({ ...filters, rating_min: val(v) ? parseFloat(v) : undefined })}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Мин. рейтинг" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>Любой рейтинг</SelectItem>
          {[9, 8, 7, 6, 5, 4].map((r) => (
            <SelectItem key={r} value={r.toString()}>от {r}.0 ★</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Сортировка */}
      <Select
        value={sortValue}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split("-");
          onChange({ ...filters, sort_by: sortBy, sort_order: sortOrder });
        }}
      >
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Сортировка" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Сброс */}
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clear} className="gap-1">
          <X className="h-3 w-3" /> Сбросить
        </Button>
      )}
    </div>
  );
}
