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
  username: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(50, "Максимум 50 символов")
    .regex(/^[a-zA-Z0-9_]+$/, "Только латинские буквы, цифры и _"),
  email: z.string().email("Введите корректный email"),
  full_name: z.string().max(100).optional(),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .regex(/[A-Z]/, "Минимум одна заглавная буква")
    .regex(/[0-9]/, "Минимум одна цифра"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Пароли не совпадают",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, isRegisterPending } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = ({ confirm_password, ...data }: FormData) => {
    registerUser(data);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">CineRating</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>Создайте аккаунт для доступа ко всем возможностям</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Имя пользователя *</Label>
                  <Input id="username" {...register("username")} placeholder="cinefan" className="mt-1" />
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="full_name">Имя</Label>
                  <Input id="full_name" {...register("full_name")} placeholder="Иван Иванов" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} placeholder="you@example.com" className="mt-1" />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input id="password" type="password" {...register("password")} placeholder="••••••••" className="mt-1" />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="confirm_password">Подтвердите пароль *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  {...register("confirm_password")}
                  placeholder="••••••••"
                  className="mt-1"
                />
                {errors.confirm_password && (
                  <p className="text-xs text-destructive mt-1">{errors.confirm_password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isRegisterPending}>
                {isRegisterPending ? "Создание аккаунта..." : "Зарегистрироваться"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Уже есть аккаунт?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Войти
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
