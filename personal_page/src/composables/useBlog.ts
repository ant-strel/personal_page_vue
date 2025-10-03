import { ref, computed, readonly } from 'vue';
import { 
  BlogServiceFactory, 
  BlogServiceType,
  BlogServiceInterface,
  BlogPost as BlogPostType,
  CreatePostData,
  UpdatePostData,
  GetPostsParams,
  PaginatedResponse 
} from '../services/blog';

// Создаем локальную версию типа BlogPost без readonly
export interface BlogPost extends BlogPostType {}

/**
 * Композабл для работы с блогом в компонентах Vue
 * @param serviceType Тип сервиса блога (mock или api)
 * @param apiBaseUrl Базовый URL API (для API-сервиса)
 */
export function useBlog(serviceType: BlogServiceType = BlogServiceType.MOCK, apiBaseUrl?: string) {
  // Создаем сервис блога
  const blogService: BlogServiceInterface = BlogServiceFactory.createBlogService(serviceType, apiBaseUrl);
  
  // Состояние
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const posts = ref<BlogPost[]>([]);
  const currentPost = ref<BlogPost | null>(null);
  const tags = ref<string[]>([]);
  
  // Пагинация
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false
  });
  
  /**
   * Получение списка статей с пагинацией и фильтрацией
   */
  async function fetchPosts(params: GetPostsParams = {}) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await blogService.getPosts(params);
      
      posts.value = response.items;
      pagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        hasMore: response.hasMore
      };
      
      return response;
    } catch (e) {
      console.error('Ошибка при получении статей:', e);
      error.value = 'Не удалось загрузить список статей';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Получение одной статьи по ID или slug
   */
  async function fetchPost(idOrSlug: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const post = await blogService.getPost(idOrSlug);
      
      if (post) {
        currentPost.value = post;
      } else {
        error.value = 'Статья не найдена';
      }
      
      return post;
    } catch (e) {
      console.error(`Ошибка при получении статьи ${idOrSlug}:`, e);
      error.value = 'Не удалось загрузить статью';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Создание новой статьи
   */
  async function createPost(postData: CreatePostData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newPost = await blogService.createPost(postData);
      currentPost.value = newPost;
      
      // Обновляем список статей, если он уже загружен
      if (posts.value.length > 0) {
        posts.value = [newPost, ...posts.value];
      }
      
      return newPost;
    } catch (e) {
      console.error('Ошибка при создании статьи:', e);
      error.value = 'Не удалось создать статью';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Обновление существующей статьи
   */
  async function updatePost(id: string, postData: UpdatePostData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedPost = await blogService.updatePost(id, postData);
      
      if (updatedPost) {
        currentPost.value = updatedPost;
        
        // Обновляем статью в списке, если она там есть
        const index = posts.value.findIndex(p => p.id === id);
        if (index !== -1) {
          posts.value[index] = updatedPost;
        }
      } else {
        error.value = 'Статья не найдена';
      }
      
      return updatedPost;
    } catch (e) {
      console.error(`Ошибка при обновлении статьи ${id}:`, e);
      error.value = 'Не удалось обновить статью';
      return null;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Удаление статьи
   */
  async function deletePost(id: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const success = await blogService.deletePost(id);
      
      if (success) {
        // Удаляем статью из списка, если она там есть
        posts.value = posts.value.filter(p => p.id !== id);
        
        // Если это текущая статья, сбрасываем её
        if (currentPost.value?.id === id) {
          currentPost.value = null;
        }
      } else {
        error.value = 'Не удалось удалить статью';
      }
      
      return success;
    } catch (e) {
      console.error(`Ошибка при удалении статьи ${id}:`, e);
      error.value = 'Не удалось удалить статью';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Получение тегов
   */
  async function fetchTags() {
    isLoading.value = true;
    
    try {
      tags.value = await blogService.getTags();
      return tags.value;
    } catch (e) {
      console.error('Ошибка при получении тегов:', e);
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  
  return {
    posts: readonly(posts),
    currentPost: readonly(currentPost),
    tags: readonly(tags),
    pagination: readonly(pagination),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    fetchTags,
    // Alias for posts for better readability in components
    blogPosts: readonly(posts)
  };
}