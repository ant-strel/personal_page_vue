// Declare module augmentations for store types
import { Store } from 'pinia'
import { useAuthStore } from './auth'
import { useBlogStore } from './blog'

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    // Add your own custom options here
  }
}

// Re-export store types for easier imports
export { useAuthStore } from './auth'
export { useBlogStore } from './blog'