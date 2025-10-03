<template>
    <div class="contact">
        <section class="hero">
            <h1 class="title">Admin Panel</h1>
            <p class="subtitle">Please login to manage your content</p>
        </section>
        
        <div class="admin-login-container">
            <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        v-model="credentials.username" 
                        required
                        class="form-control"
                        placeholder="Enter your username"
                    />
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        v-model="credentials.password" 
                        required
                        class="form-control"
                        placeholder="Enter your password"
                    />
                </div>
                
                <button type="submit" class="btn btn-primary">Login</button>
                
                <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { AuthServiceType } from '../services/auth';
import '../assets/styles/admin.css';

const router = useRouter();
const credentials = ref({
    username: '',
    password: ''
});

// Используем наш композабл авторизации
// В дальнейшем можно легко изменить тип сервиса с MOCK на API
const { isAuthenticated, isLoading, error, login, user } = useAuth(AuthServiceType.MOCK);

// Отслеживаем сообщение об ошибке из сервиса авторизации
const errorMessage = ref('');

// Если пользователь уже авторизован, перенаправляем его на страницу редактора блога
onMounted(() => {
    if (isAuthenticated.value) {
        router.push('/admin/blog-editor');
    }
});

// Обработчик входа в систему
const handleLogin = async () => {
    // Сбрасываем предыдущие ошибки
    errorMessage.value = '';
    
    // Пытаемся выполнить вход
    const success = await login(credentials.value);
    
    if (success) {
        // Перенаправляем на страницу редактора блога
        router.push('/admin/blog-editor');
    } else {
        // Отображаем ошибку
        errorMessage.value = error.value || 'Неправильное имя пользователя или пароль';
    }
};
</script>

<style scoped>
.contact {
    max-width: 600px;
    margin: 0 auto;
}
</style>