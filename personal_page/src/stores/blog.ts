import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BlogServiceInterface, BlogServiceFactory, BlogServiceType } from '../services/blog'
import { BlogPost, CreatePostData, GetPostsParams, PaginatedResponse, UpdatePostData } from '../services/blog/types'

export const useBlogStore = defineStore('blog', () => {
  // State
  const posts = ref<BlogPost[]>([])
  const currentPost = ref<BlogPost | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasMore: false
  })
  const tags = ref<string[]>([])

  // Service
  const blogService: BlogServiceInterface = BlogServiceFactory.createBlogService(BlogServiceType.MOCK)

  // Getters (computed)
  const publishedPosts = computed(() => 
    posts.value.filter(post => post.published)
  )

  // Actions
  /**
   * Fetch posts with optional filtering parameters
   */
  async function fetchPosts(params?: GetPostsParams) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await blogService.getPosts(params)
      posts.value = response.items
      pagination.value = {
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        hasMore: response.hasMore
      }
      return response
    } catch (e) {
      console.error('Error fetching posts:', e)
      error.value = 'Failed to load blog posts'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single post by ID or slug
   */
  async function fetchPost(idOrSlug: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const post = await blogService.getPost(idOrSlug)
      currentPost.value = post
      return post
    } catch (e) {
      console.error(`Error fetching post ${idOrSlug}:`, e)
      error.value = 'Failed to load blog post'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new blog post
   */
  async function createPost(postData: CreatePostData) {
    isLoading.value = true
    error.value = null
    
    try {
      const post = await blogService.createPost(postData)
      posts.value = [post, ...posts.value]
      return post
    } catch (e) {
      console.error('Error creating post:', e)
      error.value = 'Failed to create blog post'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing blog post
   */
  async function updatePost(id: string, postData: UpdatePostData) {
    isLoading.value = true
    error.value = null
    
    try {
      const updatedPost = await blogService.updatePost(id, postData)
      
      if (updatedPost) {
        // Update in posts array if it exists there
        const index = posts.value.findIndex(p => p.id === id)
        if (index !== -1) {
          posts.value[index] = updatedPost
        }
        
        // Update currentPost if it's the same one
        if (currentPost.value?.id === id) {
          currentPost.value = updatedPost
        }
      }
      
      return updatedPost
    } catch (e) {
      console.error(`Error updating post ${id}:`, e)
      error.value = 'Failed to update blog post'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a blog post
   */
  async function deletePost(id: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const success = await blogService.deletePost(id)
      
      if (success) {
        // Remove from posts array
        posts.value = posts.value.filter(post => post.id !== id)
        
        // Clear currentPost if it's the deleted one
        if (currentPost.value?.id === id) {
          currentPost.value = null
        }
      }
      
      return success
    } catch (e) {
      console.error(`Error deleting post ${id}:`, e)
      error.value = 'Failed to delete blog post'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch all tags used in blog posts
   */
  async function fetchTags() {
    isLoading.value = true
    error.value = null
    
    try {
      const fetchedTags = await blogService.getTags()
      tags.value = fetchedTags
      return fetchedTags
    } catch (e) {
      console.error('Error fetching tags:', e)
      error.value = 'Failed to load blog tags'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Return exposed state and methods
  return {
    // State
    posts,
    currentPost,
    isLoading,
    error,
    pagination,
    tags,
    
    // Getters
    publishedPosts,
    
    // Actions
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    fetchTags
  }
})