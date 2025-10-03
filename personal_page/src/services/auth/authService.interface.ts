import { AuthResponse, Credentials, User } from './types';

/**
 * Интерфейс сервиса авторизации
 * Все реализации сервиса должны соответствовать этому интерфейсу
 */
export interface AuthServiceInterface {
  /**
   * Вход в систему с учетными данными
   * @param credentials Учетные данные пользователя
   */
  login(credentials: Credentials): Promise<AuthResponse>;
  
  /**
   * Выход из системы
   */
  logout(): Promise<void>;
  
  /**
   * Проверка токена авторизации
   */
  verifyToken(): Promise<boolean>;
  
  /**
   * Получение информации о текущем пользователе
   */
  getCurrentUser(): User | null;
  
  /**
   * Проверка авторизации пользователя
   */
  isAuthenticated(): boolean;
  
  /**
   * Получение токена доступа
   */
  getToken(): string | null;
}