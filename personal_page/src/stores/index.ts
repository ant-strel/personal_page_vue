import { createPinia } from 'pinia'
import { piniaLocalStorage } from './plugins/localStorage'

// Create pinia instance
const pinia = createPinia()

// Add localStorage plugin
pinia.use(piniaLocalStorage)

// Export all store modules
export * from './auth'
export * from './blog'

// Export the pinia instance
export default pinia