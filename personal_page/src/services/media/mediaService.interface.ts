import { MediaItem, MediaUploadOptions, MediaUploadProgress, MediaUploadResponse } from './types';

/**
 * Interface for media service
 */
export interface MediaServiceInterface {
  /**
   * Upload media file
   * @param file File to upload
   * @param onProgress Callback for progress updates
   * @param options Upload options
   */
  uploadMedia(
    file: File, 
    onProgress?: (progress: MediaUploadProgress) => void,
    options?: MediaUploadOptions
  ): Promise<MediaUploadResponse>;
  
  /**
   * Get all media items
   */
  getMediaItems(): Promise<MediaItem[]>;
  
  /**
   * Delete media item
   * @param id ID of the media item to delete
   */
  deleteMedia(id: string): Promise<boolean>;
}