import { MediaServiceInterface } from './mediaService.interface';
import { MockMediaService } from './mockMediaService';

/**
 * Factory for creating media service instances
 */
export class MediaServiceFactory {
  /**
   * Create a media service instance
   * @param apiBaseUrl Base URL for API (required for API service)
   */
  static createMediaService(apiBaseUrl?: string): MediaServiceInterface {
    // For now, we only have a mock implementation
    // In the future, we can add an API implementation and choose based on environment
    return new MockMediaService();
  }
}