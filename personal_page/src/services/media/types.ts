/**
 * Types for media service
 */

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  filesize: number;
  fileType: string;
  width?: number;
  height?: number;
  createdAt: Date;
  thumbnailUrl?: string;
}

export interface ImageMediaItem extends MediaItem {
  width: number;
  height: number;
  thumbnailUrl: string;
}

export interface VideoMediaItem extends MediaItem {
  duration: number;
  thumbnailUrl: string;
}

export interface MediaUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MediaUploadResponse {
  success: boolean;
  item?: MediaItem;
  error?: string;
}