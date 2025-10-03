/**
 * Типы для сервиса аутентификации
 */

export interface User {
  id: string;
  username: string;
  email?: string;
  roles?: string[];
}

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  success: boolean;
  message?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}