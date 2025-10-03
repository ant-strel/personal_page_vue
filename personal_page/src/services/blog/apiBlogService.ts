import { BlogServiceInterface } from './blogService.interface';
import { BlogPost, CreatePostData, GetPostsParams, PaginatedResponse, UpdatePostData } from './types';

/**
 * API-сервис для работы с блогом
 * Выполняет запросы к реальному API
 */
export class ApiBlogService implements BlogServiceInterface {
  private API_URL: string = '/api/blog';
  
  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.API_URL = `${baseUrl}/blog`;
    }
  }
  
  /**
   * Получение списка статей с пагинацией и фильтрацией
   */
  async getPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<BlogPost>> {
    // Формируем URL с параметрами запроса
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.search) queryParams.append('search', params.search);
    if (params.authorId) queryParams.append('authorId', params.authorId);
    if (params.published !== undefined) queryParams.append('published', params.published.toString());
    
    const url = `${this.API_URL}/posts?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Преобразуем даты из строк в объекты Date
      const items = data.items.map((post: any) => this.normalizePost(post));
      
      return {
        ...data,
        items
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }
  
  /**
   * Получение одной статьи по ID или slug
   */
  async getPost(idOrSlug: string): Promise<BlogPost | null> {
    try {
      const response = await fetch(`${this.API_URL}/posts/${idOrSlug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const post = await response.json();
      return this.normalizePost(post);
    } catch (error) {
      console.error(`Error fetching post ${idOrSlug}:`, error);
      return null;
    }
  }
  
  /**
   * Создание новой статьи
   */
  async createPost(postData: CreatePostData): Promise<BlogPost> {
    try {
      const response = await fetch(`${this.API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const post = await response.json();
      return this.normalizePost(post);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }
  
  /**
   * Обновление существующей статьи
   */
  async updatePost(id: string, postData: UpdatePostData): Promise<BlogPost | null> {
    try {
      const response = await fetch(`${this.API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const post = await response.json();
      return this.normalizePost(post);
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Удаление статьи
   */
  async deletePost(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/posts/${id}`, {
        method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Получение всех тегов
   */
  async getTags(): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_URL}/tags`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }
  
  /**
   * Приводит даты в объекте поста к формату Date
   */
  private normalizePost(post: any): BlogPost {
    return {
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined
    };
  }
}