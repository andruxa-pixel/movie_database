export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Person {
  id: string;
  name: string;
  photo_url: string | null;
  birth_date: string | null;
  birth_place: string | null;
  bio: string | null;
}

export interface CastMember {
  person: Person;
  role: string;
  character_name: string | null;
  order_index: number;
}

export interface Movie {
  id: string;
  title: string;
  original_title: string | null;
  description: string | null;
  release_year: number | null;
  release_date: string | null;
  duration: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  trailer_url: string | null;
  country: string | null;
  language: string | null;
  age_rating: string | null;
  status: "released" | "upcoming" | "announced";
  imdb_id: string | null;
  budget: number | null;
  box_office: number | null;
  avg_rating: number;
  ratings_count: number;
  genres: Genre[];
  created_at: string;
  updated_at: string;
}

export interface MovieListItem {
  id: string;
  title: string;
  original_title: string | null;
  release_year: number | null;
  poster_url: string | null;
  avg_rating: number;
  ratings_count: number;
  duration: number | null;
  genres: Genre[];
  status: string;
}

export interface PaginatedMovies {
  items: MovieListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface UserPublic {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface UserStats {
  reviews_count: number;
  favorites_count: number;
  watchlist_count: number;
}

export interface Review {
  id: string;
  movie_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string;
  is_spoiler: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user: UserPublic;
}

export interface PaginatedReviews {
  items: Review[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Favorite {
  id: string;
  movie_id: string;
  user_id: string;
  created_at: string;
  movie: MovieListItem;
}

export interface WatchListEntry {
  id: string;
  movie_id: string;
  user_id: string;
  status: "want_to_watch" | "watching" | "watched";
  created_at: string;
  movie: MovieListItem;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
