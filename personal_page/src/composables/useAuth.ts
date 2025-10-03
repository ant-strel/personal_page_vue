import { ref, readonly, onMounted } from 'vue';
import { AuthServiceFactory, AuthServiceType, AuthServiceInterface, Credentials, User } from '../services/auth';

/**
 * Композабл для работы с авторизацией в компонентах Vue
 * @param serviceType Тип сервиса авторизации (mock или api)
 */
export function useAuth(serviceType: AuthServiceType = AuthServiceType.MOCK) {
  // Создаем сервис авторизации
  const authService: AuthServiceInterface = AuthServiceFactory.createAuthService(serviceType);
  
  // Состояние
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isAuthenticated = ref(authService.isAuthenticated());
  const user = ref<User | null>(authService.getCurrentUser());
  
  /**
   * Вход в систему
   * @param credentials Учетные данные пользователя
   */
  async function login(credentials: Credentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        isAuthenticated.value = true;
        user.value = response.user;
        return true;
      } else {
        error.value = response.message || 'Ошибка авторизации';
        return false;
      }
    } catch (e) {
      console.error('Ошибка при входе в систему:', e);
      error.value = 'Произошла неизвестная ошибка';
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Выход из системы
   */
  async function logout() {
    isLoading.value = true;
    
    try {
      await authService.logout();
      isAuthenticated.value = false;
      user.value = null;
    } catch (e) {
      console.error('Ошибка при выходе из системы:', e);
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Проверяет валидность текущего токена авторизации
   */
  async function checkAuth() {
    isLoading.value = true;
    
    try {
      const isValid = await authService.verifyToken();
      isAuthenticated.value = isValid;
      
      if (!isValid) {
        user.value = null;
      }
      
      return isValid;
    } catch (e) {
      console.error('Ошибка при проверке авторизации:', e);
      isAuthenticated.value = false;
      user.value = null;
      return false;
    } finally {
      isLoading.value = false;
    }
  }
  
  // При монтировании компонента проверяем валидность токена
  onMounted(() => {
    if (authService.getToken()) {
      checkAuth();
    }
  });
  
  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    error: readonly(error),
    login,
    logout,
    checkAuth,
  };
}