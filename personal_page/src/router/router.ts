import { createRouter, createWebHistory } from 'vue-router';

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
            path:'/admin',
            name:'admin',
            component: () => import('../views/AdminView.vue')
        },
        {
            path: '/admin/blog-editor',
            name: 'blog-editor',
            component: () => import('../views/BlogEditorView.vue')
        }
    ]
});

// Add navigation guard to check authentication
router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            next('/admin');
        } else {
            next();
        }
    } else {
        next();
    }
});