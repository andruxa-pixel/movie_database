"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Heart, List, LogIn, LogOut, Search, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Film className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary hidden sm:block">CineRating</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/movies" className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            Фильмы
          </Link>
          <Link href="/movies?sort_by=avg_rating&sort_order=desc" className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            Топ рейтинг
          </Link>
          <Link href="/movies?status=upcoming" className="px-3 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            Скоро
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск фильмов..."
              className="pl-9 bg-secondary border-0 h-9"
            />
          </div>
        </form>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                <Link href="/favorites" title="Избранное">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                <Link href="/watchlist" title="Буду смотреть">
                  <List className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile" className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block">{user?.username}</span>
                </Link>
              </Button>
              {user?.is_admin && (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/admin" title="Администрирование">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={logout} title="Выйти">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-1.5" />
                  Войти
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
