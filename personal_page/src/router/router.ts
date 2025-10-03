import { createRouter, createWebHistory } from 'vue-router';
import { AuthServiceFactory, AuthServiceType } from '../services/auth';

// Создаем экземпляр сервиса авторизации для проверки в навигационных хуках
const authService = AuthServiceFactory.createAuthService(AuthServiceType.MOCK);

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue')
        },
        {
            path: '/blog',
            name: 'blog',
            component: () => import('../views/BlogView.vue')
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import('../views/ContactView.vue')
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue')
        },
        {
            path: '/admin/blog-editor',
            name: 'blog-editor',
            component: () => import('../views/BlogEditorView.vue'),
            meta: {
                requiresAuth: true
            }
        }
    ]
});

// Навигационный хук для проверки авторизации
router.beforeEach(async (to, from, next) => {
    // Если маршрут требует авторизации
    if (to.meta.requiresAuth) {
        // Проверяем авторизацию через сервис
        const isAuthenticated = authService.isAuthenticated();
        
        if (!isAuthenticated) {
            // Перенаправляем на страницу входа, если не авторизован
            next({ name: 'admin' });
        } else {
            // Проверяем валидность токена (асинхронно)
            try {
                const isValid = await authService.verifyToken();
                if (isValid) {
                    next(); // Разрешаем доступ к защищенному маршруту
                } else {
                    next({ name: 'admin' }); // Токен недействителен
                }
            } catch (error) {
                console.error('Ошибка при проверке токена:', error);
                next({ name: 'admin' }); // На всякий случай перенаправляем на вход
            }
        }
    } else {
        // Если маршрут не требует авторизации, просто продолжаем
        next();
    }
});