<template>
  <div class="rich-editor">
    <div v-if="toolbarVisible" class="editor-toolbar">
      <div class="toolbar-section formatting">
        <button type="button" @click="insertMarkdown('**', '**')" title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" @click="insertMarkdown('*', '*')" title="Italic">
          <em>I</em>
        </button>
        <button type="button" @click="insertMarkdown('# ', '')" title="Heading 1">H1</button>
        <button type="button" @click="insertMarkdown('## ', '')" title="Heading 2">H2</button>
        <button type="button" @click="insertMarkdown('### ', '')" title="Heading 3">H3</button>
        <button type="button" @click="insertMarkdown('> ', '')" title="Quote">
          <span class="quote-icon">❝</span>
        </button>
      </div>
      
      <div class="toolbar-section lists">
        <button type="button" @click="insertMarkdown('- ', '')" title="Bullet List">•</button>
        <button type="button" @click="insertMarkdown('1. ', '')" title="Numbered List">1.</button>
        <button type="button" @click="insertMarkdown('- [ ] ', '')" title="Task List">☐</button>
      </div>
      
      <div class="toolbar-section code">
        <button type="button" @click="insertMarkdown('`', '`')" title="Inline Code">`</button>
        <button type="button" @click="insertCodeBlock()" title="Code Block">```</button>
      </div>
      
      <div class="toolbar-section media">
        <button type="button" @click="insertLink()" title="Insert Link">🔗</button>
        <button type="button" @click="showMediaLibrary('image')" title="Insert Image">📷</button>
        <button type="button" @click="showMediaLibrary('video')" title="Insert Video">🎬</button>
        <button type="button" @click="showMediaLibrary('document')" title="Insert File">📎</button>
        <button type="button" @click="showMediaLibrary('all')" title="Media Library">🖼️</button>
      </div>
      
      <div class="toolbar-section preview">
        <button type="button" @click="togglePreview" :class="{ active: isPreviewMode }">
          {{ isPreviewMode ? 'Edit' : 'Preview' }}
        </button>
      </div>
    </div>
    
    <div class="editor-content" :class="{ 'preview-mode': isPreviewMode }">
      <textarea
        v-if="!isPreviewMode"
        ref="textArea"
        :value="modelValue"
        @input="updateContent"
        :placeholder="placeholder"
        :rows="rows"
        class="markdown-input"
      ></textarea>
      
      <div v-else class="markdown-preview" v-html="renderedMarkdown"></div>
    </div>
    
    <div class="editor-footer">
      <div class="editor-info">
        <span v-if="showWordCount" class="word-count">{{ wordCount }} words</span>
        <span v-if="showCharCount" class="char-count">{{ charCount }} characters</span>
      </div>
      
      <div v-if="uploadInProgress" class="upload-status">
        <span>Uploading... {{ uploadProgress }}%</span>
        <div class="progress-bar">
          <div class="progress" :style="{ width: uploadProgress + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- Media Library Modal -->
    <MediaLibrary
      v-if="mediaLibraryVisible"
      :is-modal="true"
      :accept-images="currentMediaType === 'image' || currentMediaType === 'all'"
      :accept-videos="currentMediaType === 'video' || currentMediaType === 'all'"
      :accept-documents="currentMediaType === 'document' || currentMediaType === 'all'"
      @close="mediaLibraryVisible = false"
      @insert="handleMediaInsert"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import MediaLibrary from './MediaLibrary.vue';
import { MediaItem } from '../../services/media';

// Props
interface Props {
  modelValue: string;
  placeholder?: string;
  rows?: number;
  showWordCount?: boolean;
  showCharCount?: boolean;
  toolbarVisible?: boolean;
  autoSave?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Write your content here...',
  rows: 15,
  showWordCount: true,
  showCharCount: true,
  toolbarVisible: true,
  autoSave: true
});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'mediaInserted', media: MediaItem): void;
  (e: 'uploadError', error: string): void;
}>();

// Refs
const textArea = ref<HTMLTextAreaElement | null>(null);
const isPreviewMode = ref(false);
const uploadInProgress = ref(false);
const uploadProgress = ref(0);

// Media library state
const mediaLibraryVisible = ref(false);
const currentMediaType = ref<'image' | 'video' | 'document' | 'all'>('all');

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }
    return ''; // use external default escaping
  }
});

// Computed properties
const renderedMarkdown = computed(() => {
  return md.render(props.modelValue || '');
});

const wordCount = computed(() => {
  if (!props.modelValue) return 0;
  return props.modelValue.trim().split(/\s+/).filter(Boolean).length;
});

const charCount = computed(() => {
  return props.modelValue ? props.modelValue.length : 0;
});

// Methods
const updateContent = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const insertMarkdown = (before: string, after: string) => {
  if (!textArea.value) return;
  
  const textarea = textArea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = props.modelValue;
  
  const selectedText = text.substring(start, end);
  const replacement = before + selectedText + after;
  
  const newText = text.substring(0, start) + replacement + text.substring(end);
  emit('update:modelValue', newText);
  
  // Set cursor position after insertion
  nextTick(() => {
    textarea.focus();
    const newCursorPos = start + before.length + selectedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
  });
};

const insertCodeBlock = () => {
  const language = prompt('Enter programming language (optional):', 'javascript');
  const codeStart = '```' + (language || '') + '\n';
  const codeEnd = '\n```';
  
  insertMarkdown(codeStart, codeEnd);
};

const insertLink = () => {
  const text = prompt('Enter link text:', 'Link text');
  const url = prompt('Enter URL:', 'https://');
  
  if (text && url) {
    insertMarkdown(`[${text}](${url})`, '');
  }
};

const insertVideoEmbed = () => {
  const url = prompt('Enter video URL (YouTube, Vimeo):', 'https://www.youtube.com/watch?v=');
  
  if (url) {
    let embedCode = '';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Extract YouTube video ID
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1];
        const ampersandPosition = videoId.indexOf('&');
        if (ampersandPosition !== -1) {
          videoId = videoId.substring(0, ampersandPosition);
        }
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
      }
      
      if (videoId) {
        embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      }
    } else if (url.includes('vimeo.com')) {
      // Extract Vimeo video ID
      const vimeoId = url.split('vimeo.com/')[1];
      if (vimeoId) {
        embedCode = `<iframe src="https://player.vimeo.com/video/${vimeoId}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
      }
    }
    
    if (embedCode) {
      insertMarkdown(embedCode, '');
    } else {
      alert('Unable to embed video. Please check the URL and try again.');
    }
  }
};

const togglePreview = () => {
  isPreviewMode.value = !isPreviewMode.value;
};

// Media Library methods
const showMediaLibrary = (type: 'image' | 'video' | 'document' | 'all') => {
  currentMediaType.value = type;
  mediaLibraryVisible.value = true;
};

const handleMediaInsert = (mediaItem: MediaItem) => {
  // Insert the media based on its type
  let markdown = '';
  
  if (mediaItem.fileType.startsWith('image/')) {
    markdown = `![${mediaItem.filename}](${mediaItem.url})`;
  } else if (mediaItem.fileType.startsWith('video/')) {
    markdown = `<video controls width="100%"><source src="${mediaItem.url}" type="${mediaItem.fileType}"></video>`;
  } else {
    // For any other file type, create a download link
    markdown = `[${mediaItem.filename}](${mediaItem.url})`;
  }
  
  insertMarkdown(markdown, '');
  emit('mediaInserted', mediaItem);
  mediaLibraryVisible.value = false;
};

// Auto-resize textarea to fit content
onMounted(() => {
  if (textArea.value) {
    const tx = textArea.value;
    tx.setAttribute('style', 'height:' + (tx.scrollHeight) + 'px;overflow-y:hidden;');
    tx.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }
});
</script>

<style scoped>
.rich-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar-section {
  display: flex;
  gap: 5px;
  padding-right: 10px;
  margin-right: 10px;
  border-right: 1px solid #ddd;
}

.toolbar-section:last-child {
  border-right: none;
}

.toolbar-section button {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-section button:hover {
  background-color: #e9e9e9;
}

.toolbar-section button.active {
  background-color: #007bff;
  color: #fff;
  border-color: #0069d9;
}

.editor-content {
  flex: 1;
  min-height: 300px;
}

.markdown-input {
  width: 100%;
  border: none;
  resize: none;
  min-height: 300px;
  padding: 10px;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
}

.markdown-input:focus {
  outline: none;
}

.markdown-preview {
  padding: 10px;
  min-height: 300px;
  overflow: auto;
  line-height: 1.6;
}

.markdown-preview img {
  max-width: 100%;
  height: auto;
}

.markdown-preview pre {
  background-color: #f6f8fa;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
}

.markdown-preview code {
  font-family: 'Consolas', monospace;
  background-color: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #666;
}

.editor-info {
  display: flex;
  gap: 10px;
}

.upload-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease;
}
</style>