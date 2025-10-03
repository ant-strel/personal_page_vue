import { BlogPost, CreatePostData, GetPostsParams, PaginatedResponse, UpdatePostData } from './types';

/**
 * Интерфейс сервиса блога
 * Все реализации сервиса должны соответствовать этому интерфейсу
 */
export interface BlogServiceInterface {
  /**
   * Получение списка статей с пагинацией и фильтрацией
   * @param params Параметры запроса
   */
  getPosts(params?: GetPostsParams): Promise<PaginatedResponse<BlogPost>>;
  
  /**
   * Получение одной статьи по ID или slug
   * @param idOrSlug ID или slug статьи
   */
  getPost(idOrSlug: string): Promise<BlogPost | null>;
  
  /**
   * Создание новой статьи
   * @param postData Данные для создания статьи
   */
  createPost(postData: CreatePostData): Promise<BlogPost>;
  
  /**
   * Обновление существующей статьи
   * @param id ID статьи
   * @param postData Данные для обновления
   */
  updatePost(id: string, postData: UpdatePostData): Promise<BlogPost | null>;
  
  /**
   * Удаление статьи
   * @param id ID статьи для удаления
   */
  deletePost(id: string): Promise<boolean>;
  
  /**
   * Получение тегов (всех используемых в блоге)
   */
  getTags(): Promise<string[]>;
}