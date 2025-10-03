/**
 * Типы для сервиса блога
 */

/**
 * Языки, поддерживаемые для статей блога
 */
import { Language } from '../../composables/useI18n';

/**
 * Интерфейс для многоязычного контента
 */
export interface LocalizedContent {
  [Language.RU]?: string;
  [Language.EN]?: string;
}

/**
 * Модель статьи блога с поддержкой локализации
 */
export interface BlogPost {
  id: string;
  // Многоязычные поля
  title: string | LocalizedContent;
  content: string | LocalizedContent;
  excerpt?: string | LocalizedContent;
  // Общие поля
  slug?: string;
  author?: string;
  authorId?: string;
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  published: boolean;
  tags?: string[];
  language?: Language; // Основной язык статьи
}

/**
 * Данные для создания новой статьи
 */
export interface CreatePostData {
  title: string | LocalizedContent;
  content: string | LocalizedContent;
  slug?: string;
  excerpt?: string | LocalizedContent;
  published?: boolean;
  tags?: string[];
  language?: Language; // Основной язык статьи
}

/**
 * Данные для обновления существующей статьи
 */
export interface UpdatePostData {
  title?: string | LocalizedContent;
  content?: string | LocalizedContent;
  slug?: string;
  excerpt?: string | LocalizedContent;
  published?: boolean;
  tags?: string[];
  language?: Language; // Основной язык статьи
}

/**
 * Параметры для получения списка статей
 */
export interface GetPostsParams {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
  authorId?: string;
  published?: boolean;
  language?: Language; // Фильтр по языку
}

/**
 * Ответ с пагинацией
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}