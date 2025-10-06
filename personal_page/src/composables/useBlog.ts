import { storeToRefs } from 'pinia'
import { useBlogStore } from '../stores/blog'
import { 
  BlogPost as BlogPostType,
  CreatePostData,
  UpdatePostData,
  GetPostsParams
} from '../services/blog'

// Создаем локальную версию типа BlogPost без readonly
export interface BlogPost extends BlogPostType {}

/**
 * Композабл для работы с блогом в компонентах Vue
 * Обертка над Pinia store для сохранения обратной совместимости
 */
export function useBlog() {
  const blogStore = useBlogStore()
  
  // Используем storeToRefs для сохранения реактивности при деструктуризации
  const { 
    posts,
    currentPost,
    isLoading,
    error,
    pagination,
    tags,
    publishedPosts
  } = storeToRefs(blogStore)
  
  /**
   * Получение списка статей с пагинацией и фильтрацией
   */
  async function fetchPosts(params: GetPostsParams = {}) {
    return blogStore.fetchPosts(params)
  }
  
  /**
   * Получение одной статьи по ID или slug
   */
  async function fetchPost(idOrSlug: string) {
    return blogStore.fetchPost(idOrSlug)
  }
  
  /**
   * Создание новой статьи
   */
  async function createPost(postData: CreatePostData) {
    return blogStore.createPost(postData)
  }
  
  /**
   * Обновление существующей статьи
   */
  async function updatePost(id: string, postData: UpdatePostData) {
    return blogStore.updatePost(id, postData)
  }
  
  /**
   * Удаление статьи
   */
  async function deletePost(id: string) {
    return blogStore.deletePost(id)
  }
  
  /**
   * Получение тегов
   */
  async function fetchTags() {
    return blogStore.fetchTags()
  }
  
  return {
    posts,
    currentPost,
    tags,
    pagination,
    isLoading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    fetchTags,
    // Alias for posts for better readability in components
    blogPosts: posts
  }
}