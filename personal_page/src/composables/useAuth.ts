import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { Credentials } from '../services/auth'

/**
 * Композабл для работы с авторизацией в компонентах Vue
 * Обертка над Pinia store для сохранения обратной совместимости
 */
export function useAuth() {
  const authStore = useAuthStore()
  
  // Используем storeToRefs для сохранения реактивности при деструктуризации
  const { user, isAuthenticated, isLoading, error } = storeToRefs(authStore)
  
  /**
   * Вход в систему
   * @param credentials Учетные данные пользователя
   */
  async function login(credentials: Credentials) {
    return authStore.login(credentials)
  }
  
  /**
   * Выход из системы
   */
  async function logout() {
    return authStore.logout()
  }
  
  /**
   * Проверяет валидность текущего токена авторизации
   */
  async function checkAuth() {
    return authStore.verifyToken()
  }
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  }
}