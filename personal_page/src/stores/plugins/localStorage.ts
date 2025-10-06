import { PiniaPluginContext } from 'pinia'

/**
 * Pinia plugin to persist state to localStorage
 * @param context Pinia plugin context
 */
export function piniaLocalStorage({ store }: PiniaPluginContext) {
  // Get stored data from localStorage when the store is initialized
  const storedState = localStorage.getItem(`pinia-${store.$id}`)
  
  if (storedState) {
    try {
      store.$patch(JSON.parse(storedState))
    } catch (error) {
      console.error(`Error parsing stored state for ${store.$id}:`, error)
      localStorage.removeItem(`pinia-${store.$id}`)
    }
  }
  
  // Save state to localStorage on change
  store.$subscribe((mutation, state) => {
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state))
  }, { detached: true })
}