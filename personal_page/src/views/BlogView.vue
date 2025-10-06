<template>
    <div class="blog">
        <section class="hero">
            <h1 class="title">{{ t('blog.title') }}</h1>
            <p class="subtitle">{{ t('blog.subtitle') }}</p>
        </section>
        
        <div class="language-selector">
            <label for="language-select">{{ t('language') }}:</label>
            <select id="language-select" v-model="selectedLanguage" @change="changeLanguage">
                <option :value="Language.EN">{{ t('language.en') }}</option>
                <option :value="Language.RU">{{ t('language.ru') }}</option>
            </select>
        </div>
        
        <div v-if="isLoading" class="loading-posts">
            <p>{{ t('blog.loading') }}</p>
        </div>
        
        <div v-else-if="!posts.length" class="no-posts">
            <p>{{ t('blog.noPosts') }}</p>
        </div>
        
        <template v-else>
            <article v-for="post in posts" :key="post.id" class="blog-post">
                <h2 class="post-title">
                    <router-link :to="'/blog/' + post.slug">{{ getLocalizedField(post.title) }}</router-link>
                </h2>
                <div class="post-meta">
                    {{ formatDate(post.createdAt) }} 
                    <span v-if="post.tags && post.tags.length" class="post-tags">
                        · {{ t('blog.tags') }} 
                        <span v-for="(tag, index) in post.tags" :key="tag" class="tag">
                            {{ tag }}{{ index < post.tags.length - 1 ? ', ' : '' }}
                        </span>
                    </span>
                </div>
                <div class="post-content">
                    <p>{{ getLocalizedField(post.excerpt) || truncateContent(getLocalizedField(post.content)) }}</p>
                </div>
                <div class="post-footer">
                    <router-link :to="'/blog/' + post.slug" class="btn btn-text">{{ t('blog.continueReading') }}</router-link>
                </div>
            </article>
            
            <div class="blog-pagination" v-if="pagination.totalPages > 1">
                <button 
                    @click="prevPage" 
                    class="btn btn-outline pagination-button"
                    :disabled="pagination.page <= 1"
                >
                    {{ t('blog.previous') }}
                </button>
                <span class="pagination-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
                <button 
                    @click="nextPage" 
                    class="btn btn-outline pagination-button"
                    :disabled="!pagination.hasMore"
                >
                    {{ t('blog.next') }}
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useBlog } from '../composables/useBlog';
import { useI18n, Language } from '../composables/useI18n';
import { BlogServiceType } from '../services/blog';
import { LocalizedContent } from '../services/blog/types';

// Использование сервисов
const { posts, pagination, isLoading, fetchPosts } = useBlog();
const { t, currentLanguage, setLanguage } = useI18n();

// Локальное состояние
const currentPage = ref(1);
const selectedLanguage = ref<Language>(currentLanguage.value);

// Загрузка постов при монтировании компонента
onMounted(async () => {
    await loadPosts(1);
});

// Следим за изменением языка для перезагрузки постов
watch(currentLanguage, async () => {
    await loadPosts(currentPage.value);
}, { immediate: true });

// Загрузка постов для указанной страницы с учетом выбранного языка
const loadPosts = async (page: number) => {
    currentPage.value = page;
    await fetchPosts({
        page,
        limit: 5,
        published: true, // Показываем только опубликованные посты
        language: currentLanguage.value // Фильтруем по текущему языку
    });
};

// Смена языка
const changeLanguage = () => {
    setLanguage(selectedLanguage.value);
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

// Получение локализованного значения поля
const getLocalizedField = (field: string | LocalizedContent | undefined): string => {
    if (!field) return '';
    
    if (typeof field === 'string') {
        return field;
    }
    
    // Возвращаем значение для текущего языка или первое доступное значение
    return field[currentLanguage.value] || 
           field[Object.keys(field)[0] as Language] || 
           '';
};

// Форматирование даты в соответствии с текущим языком
const formatDate = (date: Date | string) => {
    const locale = currentLanguage.value === Language.RU ? 'ru-RU' : 'en-US';
    
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Сокращение контента для отображения
const truncateContent = (content: string, maxLength: number = 200) => {
    if (!content) return '';
    
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