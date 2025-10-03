import { BlogServiceInterface } from './blogService.interface';
import { BlogPost, CreatePostData, GetPostsParams, PaginatedResponse, UpdatePostData } from './types';

/**
 * Мок-сервис для работы с блогом
 * Использует localStorage для хранения данных
 */
export class MockBlogService implements BlogServiceInterface {
  private readonly STORAGE_KEY = 'blog-posts';
  
  /**
   * Получение списка статей с пагинацией и фильтрацией
   */
  async getPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<BlogPost>> {
    // Добавим небольшую задержку для имитации сетевого запроса
    await this.delay(300);
    
    // Получаем статьи из localStorage
    const posts = this.getStoredPosts();
    
    // Фильтрация
    let filteredPosts = [...posts];
    
    // Фильтр по опубликованным/неопубликованным
    if (params.published !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.published === params.published);
    }
    
    // Фильтр по автору
    if (params.authorId) {
      filteredPosts = filteredPosts.filter(post => post.authorId === params.authorId);
    }
    
    // Фильтр по тегу
    if (params.tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags && post.tags.includes(params.tag!)
      );
    }
    
    // Поиск по тексту (в заголовке и содержимом)
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Сортировка от новых к старым
    filteredPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Пагинация
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return {
      items: paginatedPosts,
      total: filteredPosts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPosts.length / limit),
      hasMore: endIndex < filteredPosts.length
    };
  }
  
  /**
   * Получение одной статьи по ID или slug
   */
  async getPost(idOrSlug: string): Promise<BlogPost | null> {
    await this.delay(200);
    
    const posts = this.getStoredPosts();
    
    // Пытаемся найти по ID или slug
    const post = posts.find(p => 
      p.id === idOrSlug || p.slug === idOrSlug
    );
    
    return post || null;
  }
  
  /**
   * Создание новой статьи
   */
  async createPost(postData: CreatePostData): Promise<BlogPost> {
    await this.delay(500);
    
    const posts = this.getStoredPosts();
    
    // Создаем новую статью
    const newPost: BlogPost = {
      id: this.generateId(),
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || this.generateExcerpt(postData.content),
      slug: this.generateSlug(postData.title),
      author: 'Admin User', // В моке используем фиксированного автора
      authorId: '1', // ID автора в моке
      createdAt: new Date(),
      updatedAt: new Date(),
      published: postData.published !== undefined ? postData.published : false,
      tags: postData.tags || []
    };
    
    // Добавляем статью в список
    posts.push(newPost);
    
    // Сохраняем обновленный список
    this.storePostsToLocalStorage(posts);
    
    return newPost;
  }
  
  /**
   * Обновление существующей статьи
   */
  async updatePost(id: string, postData: UpdatePostData): Promise<BlogPost | null> {
    await this.delay(500);
    
    const posts = this.getStoredPosts();
    
    // Ищем индекс статьи по ID
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Получаем текущую статью
    const post = posts[index];
    
    // Обновляем поля
    const updatedPost: BlogPost = {
      ...post,
      ...postData,
      slug: postData.title ? this.generateSlug(postData.title) : post.slug,
      excerpt: postData.excerpt || (postData.content ? this.generateExcerpt(postData.content) : post.excerpt),
      updatedAt: new Date()
    };
    
    // Обновляем статью в списке
    posts[index] = updatedPost;
    
    // Сохраняем обновленный список
    this.storePostsToLocalStorage(posts);
    
    return updatedPost;
  }
  
  /**
   * Удаление статьи
   */
  async deletePost(id: string): Promise<boolean> {
    await this.delay(300);
    
    const posts = this.getStoredPosts();
    
    // Ищем индекс статьи по ID
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Удаляем статью из списка
    posts.splice(index, 1);
    
    // Сохраняем обновленный список
    this.storePostsToLocalStorage(posts);
    
    return true;
  }
  
  /**
   * Получение всех уникальных тегов из статей
   */
  async getTags(): Promise<string[]> {
    await this.delay(200);
    
    const posts = this.getStoredPosts();
    
    // Собираем все теги из статей
    const allTags: string[] = [];
    posts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        allTags.push(...post.tags);
      }
    });
    
    // Возвращаем уникальные теги
    return [...new Set(allTags)];
  }
  
  /**
   * Вспомогательный метод для имитации задержки сетевых запросов
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Получение списка статей из localStorage
   */
  private getStoredPosts(): BlogPost[] {
    const postsJson = localStorage.getItem(this.STORAGE_KEY);
    
    if (!postsJson) {
      // Если статей нет, возвращаем пустой массив
      return [];
    }
    
    try {
      // Парсим JSON и преобразуем строковые даты в объекты Date
      const posts = JSON.parse(postsJson);
      return posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined
      }));
    } catch (e) {
      console.error('Ошибка при чтении статей из localStorage:', e);
      return [];
    }
  }
  
  /**
   * Сохранение списка статей в localStorage
   */
  private storePostsToLocalStorage(posts: BlogPost[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Ошибка при сохранении статей в localStorage:', e);
    }
  }
  
  /**
   * Генерация уникального ID для статьи
   */
  private generateId(): string {
    return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Генерация слага из заголовка
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/--+/g, '-');
  }
  
  /**
   * Генерация отрывка из контента
   */
  private generateExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Обрезаем контент до максимальной длины и добавляем многоточие
    return content.substring(0, maxLength).trim() + '...';
  }
}