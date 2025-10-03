import { AuthServiceInterface } from './authService.interface';
import { AuthResponse, Credentials, User } from './types';

/**
 * Реальная реализация сервиса авторизации для работы с API
 */
export class ApiAuthService implements AuthServiceInterface {
  private user: User | null = null;
  private token: string | null = null;
  private readonly API_URL = '/api/auth'; // URL к вашему API авторизации
  
  constructor() {
    // При инициализации проверяем, был ли пользователь уже авторизован
    this.loadUserFromStorage();
  }
  
  /**
   * Выполняет вход в систему через API
   */
  async login(credentials: Credentials): Promise<AuthResponse> {
    try {
      // Отправляем запрос на сервер
      const response = await fetch(`${this.API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      // Получаем результат
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Сохраняем пользователя и токен
        this.user = data.user;
        this.token = data.token;
        this.saveUserToStorage();
        
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      }
      
      return {
        success: false,
        message: data.message || 'Ошибка авторизации',
        user: {} as User,
        token: ''
      };
    } catch (error) {
      console.error('Ошибка при выполнении запроса авторизации:', error);
      return {
        success: false,
        message: 'Произошла ошибка при подключении к серверу',
        user: {} as User,
        token: ''
      };
    }
  }
  
  /**
   * Выполняет выход из системы через API
   */
  async logout(): Promise<void> {
    if (this.token) {
      try {
        // Отправляем запрос на сервер для инвалидации токена
        await fetch(`${this.API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
      }
    }
    
    // Очищаем локальные данные независимо от результата запроса
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }
  
  /**
   * Проверяет валидность токена через API
   */
  async verifyToken(): Promise<boolean> {
    if (!this.token) return false;
    
    try {
      const response = await fetch(`${this.API_URL}/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Возвращает текущего пользователя
   */
  getCurrentUser(): User | null {
    return this.user;
  }
  
  /**
   * Проверяет, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return !!this.user && !!this.token;
  }
  
  /**
   * Возвращает токен авторизации
   */
  getToken(): string | null {
    return this.token;
  }
  
  /**
   * Сохраняет информацию о пользователе в localStorage
   */
  private saveUserToStorage(): void {
    if (this.user) {
      localStorage.setItem('auth_user', JSON.stringify(this.user));
    }
    if (this.token) {
      localStorage.setItem('auth_token', this.token);
    }
  }
  
  /**
   * Загружает информацию о пользователе из localStorage
   */
  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('auth_user');
    const token = localStorage.getItem('auth_token');
    
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
      } catch (e) {
        console.error('Ошибка при разборе данных пользователя из localStorage', e);
        this.user = null;
      }
    }
    
    this.token = token;
  }
}