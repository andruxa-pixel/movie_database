# 🎬 CineRating — Аналог КиноПоиска / IMDb

Полноценное веб-приложение для поиска фильмов, написания рецензий и ведения списка просмотра.

## 🛠 Технологии

| Часть | Стек |
|---|---|
| **Frontend** | Next.js 14 (App Router), shadcn/ui, Tailwind CSS, React Query, Zustand |
| **Backend** | FastAPI, SQLAlchemy (async), Pydantic v2 |
| **База данных** | PostgreSQL |
| **Авторизация** | JWT (access + refresh tokens) |

---

## 📁 Структура проекта

```
Andrew/
├── backend/                   # FastAPI бэкенд
│   ├── app/
│   │   ├── api/v1/routes/     # Роутеры: auth, movies, reviews, users, favorites
│   │   ├── core/              # Конфиг, безопасность, БД
│   │   ├── crud/              # CRUD операции
│   │   ├── models/            # SQLAlchemy модели
│   │   └── schemas/           # Pydantic схемы
│   ├── alembic/               # Миграции
│   ├── seed.py                # Наполнение тестовыми данными
│   └── requirements.txt
│
├── frontend/                  # Next.js фронтенд
│   └── src/
│       ├── app/               # App Router страницы
│       │   ├── (auth)/        # Login / Register
│       │   ├── movies/        # Каталог и страница фильма
│       │   ├── profile/       # Профиль пользователя
│       │   ├── favorites/     # Избранное
│       │   ├── watchlist/     # Список просмотра
│       │   └── admin/         # Панель администратора
│       ├── components/
│       │   ├── ui/            # shadcn/ui компоненты
│       │   ├── layout/        # Header, Footer
│       │   ├── movies/        # MovieCard, MovieGrid, MovieFilters...
│       │   ├── reviews/       # ReviewCard, ReviewForm, ReviewList
│       │   ├── common/        # RatingStars, Pagination, LoadingSpinner
│       │   └── providers/     # QueryClient, Toaster
│       ├── hooks/             # useMovies, useAuth, useReviews, useFavorites
│       ├── lib/               # api.ts (axios), utils.ts
│       ├── store/             # authStore (Zustand)
│       └── types/             # TypeScript интерфейсы
│
└── docker-compose.yml
```

---

## 🚀 Быстрый старт

### Вариант 1: Docker Compose (рекомендуется)

```bash
# 1. Клонируйте репозиторий
cd C:\Development\Web-Development\Andrew

# 2. Запустите всё одной командой
docker-compose up --build

# 3. Наполните базу тестовыми данными
docker-compose exec backend python seed.py
```

Приложение будет доступно:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

---

### Вариант 2: Ручной запуск

#### Шаг 1: База данных (PostgreSQL)
```bash
# Убедитесь что PostgreSQL запущен, затем создайте БД:
psql -U postgres -c "CREATE DATABASE cinerating;"
```

#### Шаг 2: Бэкенд

```bash
cd backend

# Создайте виртуальное окружение
python -m venv venv
venv\Scripts\activate       # Windows
# или: source venv/bin/activate   # Linux/Mac

# Установите зависимости
pip install -r requirements.txt

# Скопируйте и настройте .env
copy .env.example .env
# Отредактируйте .env — укажите DATABASE_URL и SECRET_KEY

# Запустите сервер
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# В другом терминале — наполните тестовыми данными
python seed.py
```

#### Шаг 3: Фронтенд

```bash
cd frontend

# Установите зависимости
npm install

# Скопируйте переменные окружения
copy .env.local.example .env.local

# Запустите сервер разработки
npm run dev
```

---

## 🔐 Тестовые аккаунты

После запуска `seed.py`:

| Роль | Email | Пароль |
|---|---|---|
| Администратор | admin@cinerating.com | Admin123 |
| Пользователь | user@example.com | User1234 |

---

## 📡 API Endpoints

### Аутентификация
| Метод | URL | Описание |
|---|---|---|
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход (OAuth2 form) |
| POST | `/api/v1/auth/refresh` | Обновление токена |
| GET  | `/api/v1/auth/me` | Текущий пользователь |

### Фильмы
| Метод | URL | Описание |
|---|---|---|
| GET | `/api/v1/movies` | Список с фильтрацией |
| GET | `/api/v1/movies/{id}` | Фильм по ID |
| GET | `/api/v1/movies/top-rated` | Топ по рейтингу |
| GET | `/api/v1/movies/recent` | Новинки |
| GET | `/api/v1/movies/genres` | Все жанры |
| POST | `/api/v1/movies` | Создать (admin) |
| PATCH | `/api/v1/movies/{id}` | Обновить (admin) |
| DELETE | `/api/v1/movies/{id}` | Удалить (admin) |

### Рецензии
| Метод | URL | Описание |
|---|---|---|
| GET | `/api/v1/reviews/movie/{id}` | Рецензии фильма |
| GET | `/api/v1/reviews/user/{id}` | Рецензии пользователя |
| POST | `/api/v1/reviews/movie/{id}` | Написать рецензию |
| PATCH | `/api/v1/reviews/{id}` | Редактировать |
| DELETE | `/api/v1/reviews/{id}` | Удалить |

### Избранное и Вочлист
| Метод | URL | Описание |
|---|---|---|
| GET | `/api/v1/favorites` | Моё избранное |
| POST | `/api/v1/favorites/movie/{id}` | Добавить в избранное |
| DELETE | `/api/v1/favorites/movie/{id}` | Убрать из избранного |
| GET | `/api/v1/favorites/watchlist` | Мой список просмотра |
| POST | `/api/v1/favorites/watchlist/movie/{id}` | Добавить/обновить статус |

---

## 🗄️ Структура базы данных

```
users            — пользователи (email, username, password hash)
movies           — фильмы (title, year, duration, ratings...)
genres           — жанры
persons          — актёры/режиссёры
movie_genres     — связь фильм↔жанр (many-to-many)
movie_cast       — состав (фильм↔персона + роль)
reviews          — рецензии с оценкой 1-10
favorites        — избранные фильмы пользователя
watchlist        — список просмотра (want_to_watch / watching / watched)
```

---

## 🎨 Возможности

- 🔍 **Поиск и фильтрация** по названию, жанру, году, рейтингу
- ⭐ **Рейтинги** — средняя оценка автоматически пересчитывается
- 📝 **Рецензии** — с заголовком, текстом, пометкой спойлера
- ❤️ **Избранное** — личный список любимых фильмов
- 📋 **Список просмотра** — want_to_watch / watching / watched
- 👤 **Профиль** — статистика, редактирование данных
- 🔐 **JWT авторизация** с автообновлением токена
- 🛡️ **Панель администратора** — добавление фильмов
- 🌙 **Тёмная тема** (дизайн в стиле КиноПоиска)
