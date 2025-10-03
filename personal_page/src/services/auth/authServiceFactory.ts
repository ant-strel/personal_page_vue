import { ApiAuthService } from './apiAuthService';
import { AuthServiceInterface } from './authService.interface';
import { MockAuthService } from './mockAuthService';

/**
 * Перечисление доступных типов сервисов авторизации
 */
export enum AuthServiceType {
  MOCK = 'mock',
  API = 'api',
}

/**
 * Фабрика для создания сервисов авторизации
 */
export class AuthServiceFactory {
  /**
   * Создает экземпляр сервиса авторизации в зависимости от указанного типа
   * @param type Тип сервиса авторизации
   * @returns Экземпляр сервиса авторизации
   */
  static createAuthService(type: AuthServiceType = AuthServiceType.MOCK): AuthServiceInterface {
    switch (type) {
      case AuthServiceType.API:
        return new ApiAuthService();
      case AuthServiceType.MOCK:
      default:
        return new MockAuthService();
    }
  }
}