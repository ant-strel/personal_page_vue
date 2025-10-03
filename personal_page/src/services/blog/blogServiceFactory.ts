import { ApiBlogService } from './apiBlogService';
import { BlogServiceInterface } from './blogService.interface';
import { MockBlogService } from './mockBlogService';

/**
 * Перечисление доступных типов сервисов блога
 */
export enum BlogServiceType {
  MOCK = 'mock',
  API = 'api',
}

/**
 * Фабрика для создания сервисов блога
 */
export class BlogServiceFactory {
  /**
   * Создает экземпляр сервиса блога в зависимости от указанного типа
   * @param type Тип сервиса блога
   * @param apiBaseUrl Базовый URL API для API-сервиса
   * @returns Экземпляр сервиса блога
   */
  static createBlogService(type: BlogServiceType = BlogServiceType.MOCK, apiBaseUrl?: string): BlogServiceInterface {
    switch (type) {
      case BlogServiceType.API:
        return new ApiBlogService(apiBaseUrl);
      case BlogServiceType.MOCK:
      default:
        return new MockBlogService();
    }
  }
}