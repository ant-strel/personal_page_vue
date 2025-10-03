<template>
    <div class="blog">
        <section class="hero">
            <h1 class="title">Blog</h1>
            <p class="subtitle">Thoughts, ideas, and updates</p>
        </section>
        
        <div v-if="isLoading" class="loading-posts">
            <p>Loading posts...</p>
        </div>
        
        <div v-else-if="!posts.length" class="no-posts">
            <p>No posts available at the moment. Check back soon!</p>
        </div>
        
        <template v-else>
            <article v-for="post in posts" :key="post.id" class="blog-post">
                <h2 class="post-title">
                    <router-link :to="'/blog/' + post.slug">{{ post.title }}</router-link>
                </h2>
                <div class="post-meta">
                    {{ formatDate(post.createdAt) }} 
                    <span v-if="post.tags && post.tags.length" class="post-tags">
                        · Tags: 
                        <span v-for="(tag, index) in post.tags" :key="tag" class="tag">
                            {{ tag }}{{ index < post.tags.length - 1 ? ', ' : '' }}
                        </span>
                    </span>
                </div>
                <div class="post-content">
                    <p>{{ post.excerpt || truncateContent(post.content) }}</p>
                </div>
                <div class="post-footer">
                    <router-link :to="'/blog/' + post.slug" class="btn btn-text">Continue reading →</router-link>
                </div>
            </article>
            
            <div class="blog-pagination" v-if="pagination.totalPages > 1">
                <button 
                    @click="prevPage" 
                    class="btn btn-outline pagination-button"
                    :disabled="pagination.page <= 1"
                >
                    Previous
                </button>
                <span class="pagination-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
                <button 
                    @click="nextPage" 
                    class="btn btn-outline pagination-button"
                    :disabled="!pagination.hasMore"
                >
                    Next
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useBlog } from '../composables/useBlog';
import { BlogServiceType } from '../services/blog';

// Использование сервиса блога
const { posts, pagination, isLoading, fetchPosts } = useBlog(BlogServiceType.MOCK);

// Текущая страница
const currentPage = ref(1);

// Загрузка постов при монтировании компонента
onMounted(async () => {
    await loadPosts(1);
});

// Загрузка постов для указанной страницы
const loadPosts = async (page: number) => {
    currentPage.value = page;
    await fetchPosts({
        page,
        limit: 5,
        published: true // Показываем только опубликованные посты
    });
};

// Навигация по страницам
const nextPage = () => {
    if (pagination.value.hasMore) {
        loadPosts(currentPage.value + 1);
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        loadPosts(currentPage.value - 1);
    }
};

// Форматирование даты
const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Сокращение контента для отображения
const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) {
        return content;
    }
    return content.substring(0, maxLength) + '...';
};
</script>

<style scoped>
.loading-posts,
.no-posts {
    text-align: center;
    margin: 3rem 0;
    color: #666;
}

.post-tags {
    color: #666;
}

.tag {
    color: #666;
}

.pagination-info {
    margin: 0 1rem;
    color: #666;
}

.post-footer {
    margin-top: 1.5rem;
}
</style>