import Link from "next/link";
import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Film className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-primary">CineRating</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Лучший сервис для любителей кино. Читайте рецензии, ставьте оценки и открывайте новые фильмы.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Навигация</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/movies" className="hover:text-foreground transition-colors">Все фильмы</Link></li>
              <li><Link href="/movies?sort_by=avg_rating&sort_order=desc" className="hover:text-foreground transition-colors">Топ рейтинг</Link></li>
              <li><Link href="/movies?status=upcoming" className="hover:text-foreground transition-colors">Скоро в кино</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Аккаунт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Войти</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Регистрация</Link></li>
              <li><Link href="/profile" className="hover:text-foreground transition-colors">Профиль</Link></li>
              <li><Link href="/favorites" className="hover:text-foreground transition-colors">Избранное</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CineRating. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
