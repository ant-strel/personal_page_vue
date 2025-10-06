<template>
  <div class="media-library" :class="{ 'is-modal': isModal }">
    <div v-if="isModal" class="media-library-modal-overlay" @click="$emit('close')"></div>
    
    <div class="media-library-container">
      <div class="media-library-header">
        <h2>{{ t('mediaLibrary.title') }}</h2>
        <button v-if="isModal" class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="media-library-toolbar">
        <div class="upload-area">
          <button class="btn btn-primary" @click="triggerFileInput">
            {{ t('mediaLibrary.uploadButton') }}
          </button>
          <input 
            ref="fileInput" 
            type="file" 
            style="display: none"
            @change="handleFileSelection"
            :accept="allowedFileTypes.join(',')"
          />
        </div>
        
        <div class="filter-area">
          <select v-model="filterType" class="filter-dropdown">
            <option value="all">{{ t('mediaLibrary.filterAll') }}</option>
            <option value="image">{{ t('mediaLibrary.filterImages') }}</option>
            <option value="video">{{ t('mediaLibrary.filterVideos') }}</option>
            <option value="document">{{ t('mediaLibrary.filterDocuments') }}</option>
          </select>
        </div>
      </div>
      
      <div v-if="uploading" class="upload-progress">
        <p>{{ t('mediaLibrary.uploading') }}: {{ uploadFile?.name }}</p>
        <div class="progress-bar">
          <div class="progress" :style="{ width: `${uploadProgress}%` }"></div>
        </div>
        <p class="progress-text">{{ uploadProgress }}%</p>
      </div>
      
      <div class="media-library-content">
        <div v-if="loading" class="media-loading">
          <p>{{ t('mediaLibrary.loading') }}</p>
        </div>
        
        <div v-else-if="mediaItems.length === 0" class="media-empty">
          <p>{{ t('mediaLibrary.noMedia') }}</p>
        </div>
        
        <div v-else class="media-grid">
          <div 
            v-for="item in filteredMediaItems" 
            :key="item.id" 
            class="media-item"
            :class="{ 'selected': selectedItems.includes(item.id) }"
            @click="toggleSelection(item)"
          >
            <!-- Image preview -->
            <div v-if="isImage(item)" class="media-preview image-preview">
              <img :src="item.thumbnailUrl || item.url" :alt="item.filename" />
            </div>
            
            <!-- Video preview -->
            <div v-else-if="isVideo(item)" class="media-preview video-preview">
              <div class="video-thumbnail">
                <img :src="item.thumbnailUrl || '/placeholder-video.jpg'" :alt="item.filename" />
                <div class="play-icon">▶</div>
              </div>
            </div>
            
            <!-- Document preview -->
            <div v-else class="media-preview document-preview">
              <div class="document-icon">
                {{ getFileExtension(item.filename).toUpperCase() }}
              </div>
            </div>
            
            <div class="media-info">
              <p class="media-filename">{{ truncateFilename(item.filename) }}</p>
              <p class="media-filesize">{{ formatFileSize(item.filesize) }}</p>
            </div>
            
            <div class="media-actions">
              <button class="action-button insert-btn" @click.stop="insertMedia(item)">
                {{ t('mediaLibrary.insert') }}
              </button>
              <button class="action-button delete-btn" @click.stop="confirmDelete(item)">
                {{ t('mediaLibrary.delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isModal" class="media-library-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          {{ t('mediaLibrary.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '../../composables/useI18n';
import { MediaServiceFactory, MediaItem, MediaUploadProgress } from '../../services/media';

// Props
interface Props {
  isModal?: boolean;
  allowMultiple?: boolean;
  acceptImages?: boolean;
  acceptVideos?: boolean;
  acceptDocuments?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isModal: false,
  allowMultiple: false,
  acceptImages: true,
  acceptVideos: true,
  acceptDocuments: true
});

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', items: MediaItem[]): void;
  (e: 'insert', item: MediaItem): void;
}>();

// Services & composables
const { t } = useI18n();
const mediaService = MediaServiceFactory.createMediaService();

// State
const mediaItems = ref<MediaItem[]>([]);
const selectedItems = ref<string[]>([]);
const filterType = ref('all');
const loading = ref(true);
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadFile = ref<File | null>(null);

// File input ref
const fileInput = ref<HTMLInputElement | null>(null);

// Computed
const filteredMediaItems = computed(() => {
  if (filterType.value === 'all') {
    return mediaItems.value;
  }
  
  return mediaItems.value.filter(item => {
    if (filterType.value === 'image') return item.fileType.startsWith('image/');
    if (filterType.value === 'video') return item.fileType.startsWith('video/');
    if (filterType.value === 'document') {
      return !item.fileType.startsWith('image/') && 
             !item.fileType.startsWith('video/');
    }
    return true;
  });
});

const allowedFileTypes = computed(() => {
  const types: string[] = [];
  if (props.acceptImages) types.push('image/*');
  if (props.acceptVideos) types.push('video/*');
  if (props.acceptDocuments) {
    types.push('.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt');
  }
  return types;
});

// Lifecycle
onMounted(async () => {
  await loadMediaItems();
});

// Methods
const loadMediaItems = async () => {
  loading.value = true;
  try {
    mediaItems.value = await mediaService.getMediaItems();
  } catch (error) {
    console.error('Error loading media items', error);
  } finally {
    loading.value = false;
  }
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const toggleSelection = (item: MediaItem) => {
  const index = selectedItems.value.indexOf(item.id);
  
  if (index === -1) {
    // If not selected, select it
    if (props.allowMultiple) {
      selectedItems.value.push(item.id);
    } else {
      // If not allowing multiple, replace selection
      selectedItems.value = [item.id];
    }
  } else {
    // If already selected, deselect it
    selectedItems.value.splice(index, 1);
  }
  
  // Emit selection
  const selectedMediaItems = mediaItems.value.filter(
    mediaItem => selectedItems.value.includes(mediaItem.id)
  );
  
  emit('select', selectedMediaItems);
};

const handleFileSelection = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  uploadFile.value = file;
  uploading.value = true;
  uploadProgress.value = 0;
  
  try {
    const result = await mediaService.uploadMedia(
      file,
      (progress: MediaUploadProgress) => {
        uploadProgress.value = progress.percentage;
      }
    );
    
    if (result.success && result.item) {
      // Add to list
      mediaItems.value = [result.item, ...mediaItems.value];
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  } catch (error) {
    console.error('Error uploading file', error);
    alert('An error occurred during upload. Please try again.');
  } finally {
    uploading.value = false;
    uploadFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const insertMedia = (item: MediaItem) => {
  emit('insert', item);
  if (props.isModal) {
    emit('close');
  }
};

const confirmDelete = async (item: MediaItem) => {
  if (confirm(`Are you sure you want to delete ${item.filename}?`)) {
    try {
      const success = await mediaService.deleteMedia(item.id);
      if (success) {
        // Remove from list
        mediaItems.value = mediaItems.value.filter(i => i.id !== item.id);
        // Remove from selection if selected
        selectedItems.value = selectedItems.value.filter(id => id !== item.id);
      }
    } catch (error) {
      console.error('Error deleting media item', error);
      alert('An error occurred while deleting the file. Please try again.');
    }
  }
};

// Helper functions
const isImage = (item: MediaItem): boolean => {
  return item.fileType.startsWith('image/');
};

const isVideo = (item: MediaItem): boolean => {
  return item.fileType.startsWith('video/');
};

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop() || '';
};

const truncateFilename = (filename: string, maxLength: number = 15): string => {
  if (filename.length <= maxLength) return filename;
  
  const extension = getFileExtension(filename);
  const nameWithoutExt = filename.substring(0, filename.length - extension.length - 1);
  
  if (nameWithoutExt.length <= maxLength - 3) {
    return nameWithoutExt + '...' + extension;
  }
  
  return nameWithoutExt.substring(0, maxLength - 3 - extension.length) + 
         '...' + 
         extension;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
</script>

<style scoped>
.media-library {
  width: 100%;
}

.media-library.is-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.media-library-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.media-library-container {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.media-library.is-modal .media-library-container {
  max-width: 800px;
  height: 80vh;
  position: relative;
  z-index: 1001;
}

.media-library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.media-library-header h2 {
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.media-library-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
}

.upload-progress {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.progress-bar {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s;
}

.progress-text {
  text-align: right;
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.media-library-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.media-loading, 
.media-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.media-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.media-item.selected {
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
}

.media-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.document-icon {
  width: 60px;
  height: 80px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #666;
  font-size: 0.9rem;
}

.media-info {
  padding: 0.5rem;
}

.media-filename {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-filesize {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: #666;
}

.media-actions {
  display: flex;
  opacity: 0;
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.media-item:hover .media-actions {
  opacity: 1;
}

.action-button {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.insert-btn:hover {
  background-color: #4CAF50;
  border-color: #4CAF50;
  color: white;
}

.delete-btn:hover {
  background-color: #F44336;
  border-color: #F44336;
  color: white;
}

.filter-dropdown {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.media-library-footer {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
}

@media (max-width: 600px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .media-preview {
    height: 100px;
  }
}
</style>