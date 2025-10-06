import 'pinia'

// Augment the PiniaCustomProperties interface
declare module 'pinia' {
  export interface PiniaCustomProperties {
    // Define any custom properties you want to add to your stores here
  }
}