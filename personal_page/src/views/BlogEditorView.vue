<template>
    <div class="blog-editor">
        <header class="editor-header">
            <h1>Blog Editor</h1>
            <button @click="logout" class="btn btn-logout">Logout</button>
        </header>

        <div class="editor-container">
            <div class="posts-list">
                <h2>Posts</h2>
                <button @click="createNewPost" class="btn btn-create">Create New Post</button>
                
                <div class="posts-container">
                    <div 
                        v-for="post in posts" 
                        :key="post.id" 
                        @click="selectPost(post)"
                        class="post-item"
                        :class="{ 'selected': selectedPost?.id === post.id }"
                    >
                        <h3>{{ post.title }}</h3>
                        <p class="post-date">{{ formatDate(post.date) }}</p>
                        <div class="post-actions">
                            <button @click.stop="deletePost(post.id)" class="btn-delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="post-editor">
                <template v-if="selectedPost">
                    <h2>{{ isNewPost ? 'Create New Post' : 'Edit Post' }}</h2>
                    
                    <div class="form-group">
                        <label for="post-title">Title</label>
                        <input 
                            type="text" 
                            id="post-title" 
                            v-model="selectedPost.title"
                            class="form-control" 
                        />
                    </div>
                    
                    <div class="form-group">
                        <label for="post-content">Content</label>
                        <textarea 
                            id="post-content" 
                            v-model="selectedPost.content"
                            class="form-control editor-textarea" 
                            rows="15"
                        ></textarea>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import '../assets/styles/blogEditor.css';

interface Post {
    id: number;
    title: string;
    content: string;
    date: Date;
}

const router = useRouter();
const posts = ref<Post[]>([]);
const selectedPost = ref<Post | null>(null);
const isNewPost = ref(false);

onMounted(() => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem('blog-posts');
    if (savedPosts) {
        posts.value = JSON.parse(savedPosts).map((post: any) => ({
            ...post,
            date: new Date(post.date)
        }));
    }
});

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
};

const selectPost = (post: Post) => {
    selectedPost.value = { ...post };
    isNewPost.value = false;
};

const createNewPost = () => {
    isNewPost.value = true;
    selectedPost.value = {
        id: Date.now(),
        title: '',
        content: '',
        date: new Date()
    };
};

const savePost = () => {
    if (!selectedPost.value) return;
    
    if (isNewPost.value) {
        posts.value.push({ ...selectedPost.value });
    } else {
        const index = posts.value.findIndex(p => p.id === selectedPost.value?.id);
        if (index !== -1) {
            posts.value[index] = { ...selectedPost.value };
        }
    }
    
    // Save to localStorage
    localStorage.setItem('blog-posts', JSON.stringify(posts.value));
    
    isNewPost.value = false;
    selectedPost.value = null;
};

const cancelEdit = () => {
    selectedPost.value = null;
    isNewPost.value = false;
};

const deletePost = (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
        posts.value = posts.value.filter(post => post.id !== id);
        
        if (selectedPost.value?.id === id) {
            selectedPost.value = null;
        }
        
        // Save to localStorage
        localStorage.setItem('blog-posts', JSON.stringify(posts.value));
    }
};

const logout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/admin');
};
</script>
