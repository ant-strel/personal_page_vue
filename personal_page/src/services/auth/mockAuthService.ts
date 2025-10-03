import { AuthServiceInterface } from './authService.interface';
import { AuthResponse, Credentials, User } from './types';

/**
 * Mock-реализация сервиса авторизации для локального тестирования
 */
export class MockAuthService implements AuthServiceInterface {
  private user: User | null = null;
  private token: string | null = null;
  
  // Хардкодим учетные данные для тестирования
  private readonly MOCK_USERS = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      roles: ['admin']
    },
    {
      id: '2',
      username: 'editor',
      password: 'editor123',
      email: 'editor@example.com',
      roles: ['editor']
    }
  ];
  
  constructor() {
    // При инициализации проверяем, был ли пользователь уже авторизован
    this.loadUserFromStorage();
  }
  
  /**
   * Имитирует процесс входа в систему
   */
  async login(credentials: Credentials): Promise<AuthResponse> {
    // Имитация задержки сетевого запроса
    await this.delay(800);
    
    // Поиск пользователя с указанными учетными данными
    const foundUser = this.MOCK_USERS.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (foundUser) {
      // Создаем объект пользователя без пароля
      const { password, ...userWithoutPassword } = foundUser;
      const user = userWithoutPassword as User;
      
      // Генерируем случайный токен для имитации JWT
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      
      // Сохраняем пользователя и токен
      this.user = user;
      this.token = token;
      this.saveUserToStorage();
      
      return {
        success: true,
        user,
        token
      };
    }
    
    // Имитация ошибки авторизации
    return {
      success: false,
      message: 'Неправильное имя пользователя или пароль',
      user: {} as User,
      token: ''
    };
  }
  
  /**
   * Имитирует процесс выхода из системы
   */
  async logout(): Promise<void> {
    await this.delay(300);
    this.user = null;
    this.token = null;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }
  
  /**
   * Имитирует проверку токена авторизации
   */
  async verifyToken(): Promise<boolean> {
    await this.delay(300);
    return !!this.token;
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
   * Вспомогательный метод для имитации задержки сетевых запросов
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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