import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthServiceInterface, AuthServiceFactory, AuthServiceType, Credentials, User } from '../services/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Service
  const authService: AuthServiceInterface = AuthServiceFactory.createAuthService(AuthServiceType.MOCK)

  // Getters (computed)
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  // Actions
  /**
   * Initialize the auth store by checking localStorage for existing auth data
   */
  function init() {
    const storedUser = localStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Error parsing user data from localStorage', e)
        user.value = null
      }
    }
    
    token.value = storedToken

    // Verify token validity
    if (token.value) {
      verifyToken()
    }
  }

  /**
   * Login user with credentials
   */
  async function login(credentials: Credentials) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      
      if (response.success) {
        user.value = response.user
        token.value = response.token
        saveUserToStorage()
        return true
      } else {
        error.value = response.message || 'Authentication error'
        return false
      }
    } catch (e) {
      console.error('Error during login:', e)
      error.value = 'An unknown error occurred'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout the current user
   */
  async function logout() {
    isLoading.value = true
    
    try {
      if (token.value) {
        await authService.logout()
      }
    } catch (e) {
      console.error('Error during logout:', e)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      isLoading.value = false
    }
  }

  /**
   * Verify if the current token is valid
   */
  async function verifyToken() {
    if (!token.value) return false
    
    isLoading.value = true
    
    try {
      const isValid = await authService.verifyToken()
      
      if (!isValid) {
        user.value = null
        token.value = null
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }
      
      return isValid
    } catch (e) {
      console.error('Error verifying token:', e)
      user.value = null
      token.value = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Save user data to localStorage
   */
  function saveUserToStorage() {
    if (user.value) {
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    }
    if (token.value) {
      localStorage.setItem('auth_token', token.value)
    }
  }

  // Initialize the store when it's created
  init()

  // Return exposed state and methods
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    verifyToken
  }
})