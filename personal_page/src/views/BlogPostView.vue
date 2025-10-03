<template>
  <div class="blog-post-view">
    <section v-if="isLoading" class="loading-container">
      <p>{{ t('blogPost.loading') }}</p>
    </section>
    
    <section v-else-if="error" class="error-container">
      <h2>{{ t('blogPost.error') }}</h2>
      <p>{{ error }}</p>
      <router-link to="/blog" class="btn btn-outline">{{ t('blogPost.backToBlog') }}</router-link>
    </section>
    
    <section v-else-if="!post" class="not-found-container">
      <h2>{{ t('blogPost.notFound') }}</h2>
      <p>{{ t('blogPost.notFoundMessage') }}</p>
      <router-link to="/blog" class="btn btn-outline">{{ t('blogPost.backToBlog') }}</router-link>
    </section>
    
    <article v-else class="blog-post-full">
      <div class="language-selector">
        <label for="language-select">{{ t('language') }}:</label>
        <select id="language-select" v-model="selectedLanguage" @change="changeLanguage">
          <option :value="Language.EN">{{ t('language.en') }}</option>
          <option :value="Language.RU">{{ t('language.ru') }}</option>
        </select>
      </div>
      
      <header class="post-header">
        <h1 class="post-title">{{ getLocalizedField(post.title) }}</h1>
        <div class="post-meta">
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
          <span v-if="post.author" class="post-author">· {{ t('blogPost.by') }} {{ post.author }}</span>
        </div>
        
        <div v-if="post.tags && post.tags.length" class="post-tags">
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </header>
      
      <div class="post-content">
        <div v-html="renderMarkdown(getLocalizedField(post.content))"></div>
      </div>
      
      <footer class="post-footer">
        <router-link to="/blog" class="btn btn-text">{{ t('blogPost.backToBlog') }}</router-link>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBlog } from '../composables/useBlog';
import { useI18n, Language } from '../composables/useI18n';
import { BlogServiceType } from '../services/blog';
import { LocalizedContent } from '../services/blog/types';

// Использование i18n
const { t, currentLanguage, setLanguage } = useI18n();
const selectedLanguage = ref(currentLanguage.value);

// Markdown renderer (for simplicity, we'll use a basic implementation)
// In a real app, you might want to use a library like 'marked' or 'markdown-it'
function renderMarkdown(content: string): string {
  if (!content) return '';
  
  // For now, we'll just wrap paragraphs in <p> tags
  // In a real application, you would use a proper markdown parser
  return content
    .split('\n\n')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
}

// Get route params
const route = useRoute();
const slug = route.params.slug as string;

// Use blog service
const { currentPost, isLoading, error, fetchPost } = useBlog(BlogServiceType.MOCK);

// For easier template access
const post = computed(() => currentPost.value);

// Смена языка
const changeLanguage = () => {
  setLanguage(selectedLanguage.value);
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

// Load the post on component mount or when language changes
onMounted(async () => {
  if (slug) {
    await fetchPost(slug);
  }
});

watch(currentLanguage, async () => {
  if (slug) {
    await fetchPost(slug);
  }
});

// Format date
const formatDate = (date: Date | string) => {
  const locale = currentLanguage.value === Language.RU ? 'ru-RU' : 'en-US';
  
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.blog-post-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading-container,
.error-container,
.not-found-container {
  text-align: center;
  margin: 3rem 0;
}

.post-header {
  margin-bottom: 2rem;
}

.post-title {
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  line-height: 1.2;
}

.post-meta {
  color: #666;
  margin-bottom: 1rem;
}

.post-author {
  margin-left: 0.25rem;
}

.post-tags {
  margin: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #666;
}

.post-content {
  margin: 2rem 0;
  line-height: 1.7;
}

.post-content p {
  margin-bottom: 1.5rem;
}

.post-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>