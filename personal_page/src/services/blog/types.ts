/**
 * Типы для сервиса блога
 */

/**
 * Модель статьи блога
 */
export interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  author?: string;
  authorId?: string;
  createdAt: Date;
  updatedAt?: Date;
  publishedAt?: Date;
  published: boolean;
  tags?: string[];
}

/**
 * Данные для создания новой статьи
 */
export interface CreatePostData {
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  published?: boolean;
  tags?: string[];
}

/**
 * Данные для обновления существующей статьи
 */
export interface UpdatePostData {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  published?: boolean;
  tags?: string[];
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