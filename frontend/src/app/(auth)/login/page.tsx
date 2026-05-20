"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login, isLoginPending } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">CineRating</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Вход</CardTitle>
            <CardDescription>Введите данные для входа в аккаунт</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => login(data))} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="mt-1"
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoginPending}>
                {isLoginPending ? "Вход..." : "Войти"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-4 p-3 bg-card rounded-lg border border-border text-xs text-muted-foreground">
          <p className="font-medium mb-1">Тестовые аккаунты:</p>
          <p>Админ: admin@cinerating.com / Admin123</p>
          <p>Юзер: user@example.com / User1234</p>
        </div>
      </div>
    </div>
  );
}
