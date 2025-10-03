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
                            <h3>{{ post.title }}</h3>
                            <p class="post-date">{{ formatDate(post.createdAt) }}</p>
                            <span v-if="!post.published" class="draft-badge">Draft</span>
                            <div class="post-actions">
                                <button @click.stop="deletePost(post.id)" class="btn-delete">Delete</button>
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
                        
                        <div class="form-group">
                            <label for="post-title">Title</label>
                            <input 
                                type="text" 
                                id="post-title" 
                                v-model="postForm.title"
                                class="form-control" 
                                placeholder="Enter post title"
                            />
                        </div>
                        
                        <div class="form-group">
                            <label for="post-slug">Slug (URL)</label>
                            <input 
                                type="text" 
                                id="post-slug" 
                                v-model="postForm.slug"
                                class="form-control" 
                                placeholder="post-url-slug"
                            />
                            <small class="form-help">Leave empty to auto-generate from title</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="post-excerpt">Excerpt (Summary)</label>
                            <textarea 
                                id="post-excerpt" 
                                v-model="postForm.excerpt"
                                class="form-control" 
                                rows="3"
                                placeholder="Brief description of your post..."
                            ></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="post-content">Content</label>
                            <textarea 
                                id="post-content" 
                                v-model="postForm.content"
                                class="form-control editor-textarea" 
                                rows="15"
                                placeholder="Write your post content here..."
                            ></textarea>
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
import { ref, onMounted, computed, reactive } from 'vue';
import { AuthServiceType } from '../services/auth';
import { BlogServiceType, CreatePostData, UpdatePostData } from '../services/blog';
import { useBlog, BlogPost } from '../composables/useBlog';
import AuthGuard from '../components/auth/AuthGuard.vue';
import UserProfile from '../components/auth/UserProfile.vue';
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
} = useBlog(BlogServiceType.MOCK);

// Локальное состояние для редактора
const selectedPost = ref<BlogPost | null>(null);
const isNewPost = ref(false);
// For tag input
const newTagInput = ref('');

const postForm = reactive({
    title: '',
    content: '',
    slug: '',
    excerpt: '',
    published: false,
    tags: [] as string[]
});

// Загружаем статьи при монтировании компонента
onMounted(async () => {
    await fetchPosts({ limit: 50 });  // Загружаем до 50 статей для удобства
    await fetchTags();  // Загружаем теги
});

// Форматирование даты
const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
};

// Выбор статьи для редактирования
const selectPost = async (post: BlogPost) => {
    isNewPost.value = false;
    // Загружаем полную версию статьи (возможно, с дополнительными данными)
    const fullPost = await fetchPost(post.id);
    
    if (fullPost) {
        selectedPost.value = fullPost;
        // Заполняем форму данными статьи
        postForm.title = fullPost.title;
        postForm.content = fullPost.content;
        postForm.slug = fullPost.slug || '';
        postForm.excerpt = fullPost.excerpt || '';
        postForm.published = fullPost.published;
        postForm.tags = fullPost.tags || [];
    }
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
    
    // Очищаем форму
    postForm.title = '';
    postForm.content = '';
    postForm.slug = '';
    postForm.excerpt = '';
    postForm.published = false;
    postForm.tags = [];
};

// Сохранение статьи
const savePost = async () => {
    if (!postForm.title.trim() || !postForm.content.trim()) {
        alert('Заголовок и содержимое статьи обязательны');
        return;
    }
    
    try {
        if (isNewPost.value) {
            // Создаем новую статью
            const newPostData: CreatePostData = {
                title: postForm.title,
                content: postForm.content,
                slug: postForm.slug.trim() || undefined,
                excerpt: postForm.excerpt.trim() || undefined,
                published: postForm.published,
                tags: postForm.tags
            };
            
            await createPost(newPostData);
        } else if (selectedPost.value) {
            // Обновляем существующую статью
            const updatePostData: UpdatePostData = {
                title: postForm.title,
                content: postForm.content,
                slug: postForm.slug.trim() || undefined,
                excerpt: postForm.excerpt.trim() || undefined,
                published: postForm.published,
                tags: postForm.tags
            };
            
            await updatePost(selectedPost.value.id, updatePostData);
        }
        
        // Сбрасываем состояние редактора
        isNewPost.value = false;
        selectedPost.value = null;
        
        // Обновляем список статей
        await fetchPosts({ limit: 50 });
    } catch (e) {
        console.error('Ошибка при сохранении статьи:', e);
        alert('Не удалось сохранить статью');
    }
};

// Отмена редактирования
const cancelEdit = () => {
    selectedPost.value = null;
    isNewPost.value = false;
    
    // Очищаем форму
    postForm.title = '';
    postForm.content = '';
    postForm.slug = '';
    postForm.excerpt = '';
    postForm.published = false;
    postForm.tags = [];
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
</script>
