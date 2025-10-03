<template>
    <div class="user-profile">
        <div v-if="user" class="user-info">
            <span class="user-name">{{ user.username }}</span>
            <button @click="handleLogout" class="btn btn-logout">Выйти</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '../../composables/useAuth';
import { AuthServiceType } from '../../services/auth';
import { useRouter } from 'vue-router';

const props = defineProps({
    serviceType: {
        type: String,
        default: AuthServiceType.MOCK
    }
});

const router = useRouter();
const { user, logout } = useAuth(props.serviceType as AuthServiceType);

const handleLogout = async () => {
    await logout();
    router.push('/admin');
};
</script>

<style scoped>
.user-profile {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-name {
    font-weight: 500;
}

.btn-logout {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
}
</style>