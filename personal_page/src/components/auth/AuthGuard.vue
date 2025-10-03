<template>
    <div v-if="isLoading" class="auth-loading">
        <p>Проверка авторизации...</p>
    </div>
    <slot v-else-if="isAuthenticated"></slot>
    <div v-else>
        <p>У вас нет доступа к этой странице.</p>
        <button @click="navigateToLogin" class="btn">Войти в систему</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { AuthServiceType } from '../../services/auth';

const props = defineProps({
    serviceType: {
        type: String,
        default: AuthServiceType.MOCK
    }
});

const router = useRouter();
const { isAuthenticated, isLoading, checkAuth } = useAuth(props.serviceType as AuthServiceType);

// При монтировании компонента проверяем авторизацию
onMounted(async () => {
    const isValid = await checkAuth();
    if (!isValid) {
        router.push('/admin');
    }
});

// Функция для перенаправления на страницу входа
const navigateToLogin = () => {
    router.push('/admin');
};
</script>

<style scoped>
.auth-loading {
    padding: 2rem;
    text-align: center;
}
</style>