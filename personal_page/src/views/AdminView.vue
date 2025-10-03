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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import '../assets/styles/admin.css';

const router = useRouter();
const credentials = ref({
    username: '',
    password: ''
});
const errorMessage = ref('');

const handleLogin = () => {
    // This is a simple example - in a real app, you would call an API
    if (credentials.value.username === 'admin' && credentials.value.password === 'password') {
        // Store authentication state (in a real app, use a token)
        localStorage.setItem('isLoggedIn', 'true');
        // Redirect to blog editor
        router.push('/admin/blog-editor');
        errorMessage.value = '';
    } else {
        errorMessage.value = 'Invalid username or password';
    }
};
</script>

<style scoped>
.contact {
    max-width: 600px;
    margin: 0 auto;
}
</style>