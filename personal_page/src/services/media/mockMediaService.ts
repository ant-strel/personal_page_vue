import { v4 as uuidv4 } from 'uuid';
import { MediaServiceInterface } from './mediaService.interface';
import { MediaItem, MediaUploadOptions, MediaUploadProgress, MediaUploadResponse } from './types';

/**
 * Mock implementation of media service for development
 */
export class MockMediaService implements MediaServiceInterface {
  private mediaItems: MediaItem[] = [];
  
  constructor() {
    // Initialize with some dummy media items
    this.mediaItems = [
      {
        id: uuidv4(),
        url: 'https://via.placeholder.com/640x480',
        filename: 'example-image.jpg',
        filesize: 12345,
        fileType: 'image/jpeg',
        width: 640,
        height: 480,
        createdAt: new Date(),
        thumbnailUrl: 'https://via.placeholder.com/150x150'
      }
    ];
  }
  
  /**
   * Upload media file (mock implementation)
   */
  async uploadMedia(
    file: File,
    onProgress?: (progress: MediaUploadProgress) => void,
    options?: MediaUploadOptions
  ): Promise<MediaUploadResponse> {
    // Check file size
    const maxSize = options?.maxSize || 5 * 1024 * 1024; // Default 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)`
      };
    }
    
    // Check file type
    const allowedTypes = options?.allowedTypes || ['image/*', 'video/*', 'application/pdf'];
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category + '/');
      }
      return file.type === type;
    });
    
    if (!isAllowed) {
      return {
        success: false,
        error: `File type "${file.type}" is not allowed`
      };
    }
    
    // Simulate upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) {
        onProgress({
          loaded: progress * file.size / 100,
          total: file.size,
          percentage: progress
        });
      }
      
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
    
    // Wait for "upload" to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create media item
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    const newItem: MediaItem = {
      id: uuidv4(),
      url: URL.createObjectURL(file),
      filename: file.name,
      filesize: file.size,
      fileType: file.type,
      createdAt: new Date()
    };
    
    if (isImage) {
      newItem.width = 640; // Mock width
      newItem.height = 480; // Mock height
      newItem.thumbnailUrl = newItem.url;
    }
    
    // Add to collection
    this.mediaItems.push(newItem);
    
    return {
      success: true,
      item: newItem
    };
  }
  
  /**
   * Get all media items
   */
  async getMediaItems(): Promise<MediaItem[]> {
    return this.mediaItems;
  }
  
  /**
   * Delete media item
   */
  async deleteMedia(id: string): Promise<boolean> {
    const initialCount = this.mediaItems.length;
    this.mediaItems = this.mediaItems.filter(item => item.id !== id);
    return this.mediaItems.length !== initialCount;
  }
}