<template>
    <AuthGuard>
        <div class="blog-editor">
            <header class="editor-header">
                <h1>Blog Editor</h1>
                <UserProfile />
            </header>

            <div class="editor-container">
                <div class="posts-list">
                    <h2>Posts</h2>
                    <button @click="createNewPost" class="btn btn-create">Create New Post</button>
                    
                    <div v-if="isLoading && !blogPosts.length" class="loading-posts">
                        <p>Loading posts...</p>
                    </div>
                    
                    <div v-else-if="!blogPosts.length" class="no-posts">
                        <p>No posts found. Create your first post!</p>
                    </div>
                    
                    <div v-else class="posts-container">
                        <div 
                            v-for="post in blogPosts" 
                            :key="post.id" 
                            @click="selectPost(post)"
                            class="post-item"
                            :class="{ 'selected': selectedPost?.id === post.id }"
                        >
                            <h3>{{ getLocalizedTitle(post) }}</h3>
                            <p class="post-date">
                                {{ formatDate(post.createdAt) }}
                                <span v-if="post.language" class="language-badge">{{ post.language }}</span>
                                <span v-else class="language-badge multi">{{ t('blogEditor.multilingual') }}</span>
                            </p>
                            <span v-if="!post.published" class="draft-badge">{{ t('blogEditor.draft') }}</span>
                            <div class="post-actions">
                                <button @click.stop="deletePost(post.id)" class="btn-delete">{{ t('blogEditor.delete') }}</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="post-editor">
                    <div v-if="isLoading && selectedPost" class="loading-editor">
                        <p>Loading...</p>
                    </div>
                    
                    <template v-else-if="isNewPost || selectedPost">
                        <h2>{{ isNewPost ? 'Create New Post' : 'Edit Post' }}</h2>
                        
                        <!-- Выбор языка для статьи -->
                        <div class="form-group">
                            <label for="post-language">{{ t('blogEditor.language') }}</label>
                            <select 
                                id="post-language" 
                                v-model="postForm.language" 
                                class="form-control"
                            >
                                <option :value="undefined">{{ t('blogEditor.multilingual') }}</option>
                                <option v-for="lang in availableLanguages" :key="lang" :value="lang">
                                    {{ lang === Language.EN ? 'English' : 'Русский' }}
                                </option>
                            </select>
                        </div>
                        
                        <!-- Одноязычная форма (когда выбран конкретный язык) -->
                        <template v-if="postForm.language">
                            <div class="form-group">
                                <label for="post-title">{{ t('blogEditor.fieldTitle') }}</label>
                                <input 
                                    type="text" 
                                    id="post-title" 
                                    v-model="singleLanguageForm.title"
                                    class="form-control" 
                                    :placeholder="t('blogEditor.titlePlaceholder')"
                                />
                            </div>
                            
                            <div class="form-group">
                                <label for="post-excerpt">{{ t('blogEditor.fieldExcerpt') }}</label>
                                <textarea 
                                    id="post-excerpt" 
                                    v-model="singleLanguageForm.excerpt"
                                    class="form-control" 
                                    rows="3"
                                    :placeholder="t('blogEditor.excerptPlaceholder')"
                                ></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="post-content">{{ t('blogEditor.fieldContent') }}</label>
                                <RichEditor
                                    id="post-content"
                                    v-model="singleLanguageForm.content"
                                    :placeholder="t('blogEditor.contentPlaceholder')"
                                    :rows="15"
                                    @media-inserted="handleMediaInserted"
                                />
                            </div>
                        </template>
                        
                        <!-- Многоязычная форма (когда язык не выбран) -->
                        <template v-else>
                            <div class="language-tabs">
                                <div 
                                    v-for="lang in availableLanguages" 
                                    :key="lang" 
                                    @click="activeLanguageTab = lang"
                                    class="lang-tab"
                                    :class="{ active: activeLanguageTab === lang }"
                                >
                                    {{ lang === Language.EN ? 'English' : 'Русский' }}
                                </div>
                            </div>
                            
                            <div class="tab-content">
                                <div class="form-group">
                                    <label for="post-title">{{ t('blogEditor.fieldTitle') }}</label>
                                    <input 
                                        type="text" 
                                        id="post-title" 
                                        v-model="multiLanguageForm[activeLanguageTab].title"
                                        class="form-control" 
                                        :placeholder="t('blogEditor.titlePlaceholder')"
                                    />
                                </div>
                                
                                <div class="form-group">
                                    <label for="post-excerpt">{{ t('blogEditor.fieldExcerpt') }}</label>
                                    <textarea 
                                        id="post-excerpt" 
                                        v-model="multiLanguageForm[activeLanguageTab].excerpt"
                                        class="form-control" 
                                        rows="3"
                                        :placeholder="t('blogEditor.excerptPlaceholder')"
                                    ></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="post-content">{{ t('blogEditor.fieldContent') }}</label>
                                    <RichEditor
                                        id="post-content"
                                        v-model="multiLanguageForm[activeLanguageTab].content"
                                        :placeholder="t('blogEditor.contentPlaceholder')"
                                        :rows="15"
                                        @media-inserted="handleMediaInserted"
                                    />
                                </div>
                            </div>
                        </template>
                        
                        <!-- Общие поля для обоих типов форм -->
                        <div class="form-group">
                            <label for="post-slug">{{ t('blogEditor.slug') }}</label>
                            <input 
                                type="text" 
                                id="post-slug" 
                                v-model="postForm.slug"
                                class="form-control" 
                                placeholder="post-url-slug"
                            />
                            <small class="form-help">{{ t('blogEditor.slugHelp') }}</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="post-tags">Tags</label>
                            <div class="tags-container">
                                <div class="selected-tags">
                                    <span v-for="tag in postForm.tags" :key="tag" class="selected-tag">
                                        {{ tag }}
                                        <button @click="removeTag(tag)" class="remove-tag">×</button>
                                    </span>
                                </div>
                                <div class="tags-input-container">
                                    <input 
                                        type="text" 
                                        id="post-tags" 
                                        v-model="newTagInput"
                                        class="form-control" 
                                        placeholder="Add a tag and press Enter"
                                        @keydown.enter.prevent="addTag"
                                    />
                                    <button @click="addTag" class="btn btn-small">Add</button>
                                </div>
                                
                                <div v-if="availableTags.length > 0" class="available-tags">
                                    <p>Available tags:</p>
                                    <div class="tags-list">
                                        <span 
                                            v-for="tag in availableTags" 
                                            :key="tag" 
                                            @click="selectTag(tag)" 
                                            class="available-tag"
                                            :class="{ 'selected': postForm.tags.includes(tag) }"
                                        >
                                            {{ tag }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" v-model="postForm.published">
                                Publish this post
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button @click="savePost" class="btn btn-save">Save</button>
                            <button @click="cancelEdit" class="btn btn-cancel">Cancel</button>
                        </div>
                    </template>
                    
                    <div v-else class="no-post-selected">
                        <p>Select a post to edit or create a new one</p>
                    </div>
                </div>
            </div>
        </div>
    </AuthGuard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { CreatePostData, UpdatePostData } from '../services/blog';
import { LocalizedContent } from '../services/blog/types';
import { useBlog, BlogPost } from '../composables/useBlog';
import { useI18n, Language } from '../composables/useI18n';
import AuthGuard from '../components/auth/AuthGuard.vue';
import UserProfile from '../components/auth/UserProfile.vue';
import RichEditor from '../components/editor/RichEditor.vue';
import { MediaItem } from '../services/media';
import 'highlight.js/styles/github.css';
import '../assets/styles/blogEditor.css';

// Используем сервис блога через композабл
const { 
    posts: blogPosts, 
    currentPost, 
    tags: availableTags,
    isLoading, 
    error, 
    fetchPosts, 
    fetchPost, 
    createPost, 
    updatePost, 
    deletePost: removeBlogPost,
    fetchTags 
} = useBlog();

// Получаем i18n сервис
const { t, currentLanguage, setLanguage } = useI18n();

// Локальное состояние для редактора
const selectedPost = ref<BlogPost | null>(null);
const isNewPost = ref(false);
const newTagInput = ref('');
const activeLanguageTab = ref<Language>(Language.EN);
const availableLanguages = [Language.EN, Language.RU];

// Общая форма с общими полями
const postForm = reactive({
    language: undefined as Language | undefined, // язык статьи, undefined - многоязычная статья
    slug: '',
    published: false,
    tags: [] as string[]
});

// Форма для одноязычной статьи
const singleLanguageForm = reactive({
    title: '',
    content: '',
    excerpt: ''
});

// Форма для многоязычной статьи
const multiLanguageForm = reactive({
    [Language.EN]: {
        title: '',
        content: '',
        excerpt: ''
    },
    [Language.RU]: {
        title: '',
        content: '',
        excerpt: ''
    }
});

// Загружаем статьи при монтировании компонента
onMounted(async () => {
    await fetchPosts({ limit: 50 });  // Загружаем до 50 статей для удобства
    await fetchTags();  // Загружаем теги
});

// Получение локализованного заголовка
const getLocalizedTitle = (post: any): string => {
    if (typeof post.title === 'string') {
        return post.title;
    }
    
    // Если это объект локализации, пробуем получить значение для текущего языка
    if (typeof post.title === 'object') {
        const currentLang = currentLanguage.value;
        
        if (post.title[currentLang]) {
            return post.title[currentLang];
        }
        
        // Если нет перевода на текущем языке, возвращаем первый доступный
        const availableLang = Object.keys(post.title).find(lang => 
            post.title[lang as Language] !== undefined && 
            post.title[lang as Language] !== ''
        );
        
        if (availableLang) {
            return post.title[availableLang as Language] || '';
        }
    }
    
    return t('blogEditor.untitled');
};

// Получение локализованного поля
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

// Форматирование даты
const formatDate = (date: Date | string) => {
    const locale = currentLanguage.value === Language.RU ? 'ru-RU' : 'en-US';
    return new Date(date).toLocaleDateString(locale);
};

// Выбор статьи для редактирования
const selectPost = async (post: BlogPost) => {
    isNewPost.value = false;
    
    // Загружаем полную версию статьи (возможно, с дополнительными данными)
    const fullPost = await fetchPost(post.id);
    
    if (fullPost) {
        selectedPost.value = fullPost;
        
        // Заполняем общие поля формы
        postForm.slug = fullPost.slug || '';
        postForm.published = fullPost.published;
        postForm.tags = fullPost.tags || [];
        postForm.language = fullPost.language;
        
        // Определяем тип контента (одноязычный или многоязычный)
        if (fullPost.language) {
            // Одноязычный контент
            singleLanguageForm.title = typeof fullPost.title === 'string' 
                ? fullPost.title 
                : fullPost.title[fullPost.language] || '';
                
            singleLanguageForm.content = typeof fullPost.content === 'string' 
                ? fullPost.content 
                : fullPost.content[fullPost.language] || '';
                
            singleLanguageForm.excerpt = fullPost.excerpt 
                ? (typeof fullPost.excerpt === 'string' 
                    ? fullPost.excerpt 
                    : fullPost.excerpt[fullPost.language] || '') 
                : '';
        } else {
            // Многоязычный контент
            resetMultiLanguageForm();
            
            // Заполняем формы для каждого языка
            if (typeof fullPost.title === 'object') {
                Object.keys(fullPost.title).forEach(lang => {
                    if (lang in multiLanguageForm) {
                        multiLanguageForm[lang as Language].title = fullPost.title[lang as Language] || '';
                    }
                });
            }
            
            if (typeof fullPost.content === 'object') {
                Object.keys(fullPost.content).forEach(lang => {
                    if (lang in multiLanguageForm) {
                        multiLanguageForm[lang as Language].content = fullPost.content[lang as Language] || '';
                    }
                });
            }
            
            if (fullPost.excerpt && typeof fullPost.excerpt === 'object') {
                Object.keys(fullPost.excerpt).forEach(lang => {
                    if (lang in multiLanguageForm && fullPost.excerpt) {
                        multiLanguageForm[lang as Language].excerpt = fullPost.excerpt[lang as Language] || '';
                    }
                });
            }
        }
    }
};

// Сброс многоязычной формы
const resetMultiLanguageForm = () => {
    Object.keys(multiLanguageForm).forEach(lang => {
        multiLanguageForm[lang as Language].title = '';
        multiLanguageForm[lang as Language].content = '';
        multiLanguageForm[lang as Language].excerpt = '';
    });
};

// Работа с тегами
const addTag = () => {
    const tag = newTagInput.value.trim();
    if (tag && !postForm.tags.includes(tag)) {
        postForm.tags.push(tag);
    }
    newTagInput.value = '';
};

const removeTag = (tag: string) => {
    postForm.tags = postForm.tags.filter(t => t !== tag);
};

const selectTag = (tag: string) => {
    if (postForm.tags.includes(tag)) {
        removeTag(tag);
    } else {
        postForm.tags.push(tag);
    }
};

// Создание новой статьи
const createNewPost = () => {
    isNewPost.value = true;
    selectedPost.value = null;
    
    // Очищаем общую форму
    postForm.slug = '';
    postForm.published = false;
    postForm.tags = [];
    postForm.language = Language.EN;  // По умолчанию создаем статью на английском
    
    // Сбрасываем формы для каждого языка
    singleLanguageForm.title = '';
    singleLanguageForm.content = '';
    singleLanguageForm.excerpt = '';
    
    // Сбрасываем многоязычную форму
    resetMultiLanguageForm();
};

// Проверка наличия обязательных полей
const validateForm = () => {
    if (postForm.language) {
        // Одноязычная статья
        if (!singleLanguageForm.title.trim() || !singleLanguageForm.content.trim()) {
            alert(t('error.required'));
            return false;
        }
    } else {
        // Многоязычная статья - нужен хотя бы один язык с заполненными полями
        let hasValidContent = false;
        
        for (const lang of Object.keys(multiLanguageForm)) {
            if (multiLanguageForm[lang as Language].title.trim() && 
                multiLanguageForm[lang as Language].content.trim()) {
                hasValidContent = true;
                break;
            }
        }
        
        if (!hasValidContent) {
            alert(t('blogEditor.error.noLanguage'));
            return false;
        }
    }
    
    return true;
};

// Получение данных для создания/обновления статьи
const getPostData = () => {
    if (postForm.language) {
        // Одноязычная статья
        return {
            title: singleLanguageForm.title,
            content: singleLanguageForm.content,
            excerpt: singleLanguageForm.excerpt.trim() || undefined,
            slug: postForm.slug.trim() || undefined,
            published: postForm.published,
            tags: postForm.tags,
            language: postForm.language
        };
    } else {
        // Многоязычная статья
        const title: LocalizedContent = {};
        const content: LocalizedContent = {};
        const excerpt: LocalizedContent = {};
        
        // Собираем только заполненные поля
        for (const lang of Object.keys(multiLanguageForm)) {
            const langKey = lang as Language;
            if (multiLanguageForm[langKey].title.trim()) {
                title[langKey] = multiLanguageForm[langKey].title;
            }
            if (multiLanguageForm[langKey].content.trim()) {
                content[langKey] = multiLanguageForm[langKey].content;
            }
            if (multiLanguageForm[langKey].excerpt.trim()) {
                excerpt[langKey] = multiLanguageForm[langKey].excerpt;
            }
        }
        
        return {
            title,
            content,
            excerpt: Object.keys(excerpt).length > 0 ? excerpt : undefined,
            slug: postForm.slug.trim() || undefined,
            published: postForm.published,
            tags: postForm.tags
        };
    }
};

// Сохранение статьи
const savePost = async () => {
    if (!validateForm()) {
        return;
    }
    
    try {
        const postData = getPostData();
        
        if (isNewPost.value) {
            // Создаем новую статью
            await createPost(postData as CreatePostData);
        } else if (selectedPost.value) {
            // Обновляем существующую статью
            await updatePost(selectedPost.value.id, postData as UpdatePostData);
        }
        
        // Сбрасываем состояние редактора
        isNewPost.value = false;
        selectedPost.value = null;
        
        // Обновляем список статей
        await fetchPosts({ limit: 50 });
    } catch (e) {
        console.error('Ошибка при сохранении статьи:', e);
        alert(t('blogEditor.error.save'));
    }
};

// Отмена редактирования
const cancelEdit = () => {
    selectedPost.value = null;
    isNewPost.value = false;
    
    // Очищаем общую форму
    postForm.slug = '';
    postForm.published = false;
    postForm.tags = [];
    postForm.language = undefined;
    
    // Очищаем одноязычную форму
    singleLanguageForm.title = '';
    singleLanguageForm.content = '';
    singleLanguageForm.excerpt = '';
    
    // Очищаем многоязычную форму
    resetMultiLanguageForm();
    
    // Очищаем поле тега
    newTagInput.value = '';
};

// Удаление статьи
const deletePost = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту статью?')) {
        const success = await removeBlogPost(id);
        
        if (success) {
            if (selectedPost.value?.id === id) {
                selectedPost.value = null;
            }
        } else {
            alert('Не удалось удалить статью');
        }
    }
};

// Обработка вставки медиа
const handleMediaInserted = (media: MediaItem) => {
    console.log('Media inserted:', media);
    // В реальном приложении здесь может быть логика для отслеживания 
    // используемых медиафайлов или обработка дополнительных действий
};
</script>
