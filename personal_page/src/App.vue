<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useI18n, Language } from './composables/useI18n'
import { ref, watch } from 'vue'

const { t, currentLanguage, setLanguage } = useI18n()
const selectedLanguage = ref<Language>(currentLanguage.value)

// Keep the selector in sync with the actual language
watch(currentLanguage, (newLang) => {
  selectedLanguage.value = newLang
})

// Change language when selector changes
const changeLanguage = () => {
  setLanguage(selectedLanguage.value)
}
</script>

<template>
  <div class="layout">
   <!--nav header -->
   <header class="header">
      <div class="app-container">
        <div class="logo">
            <RouterLink to="/">{{ t('app.siteName') }}</RouterLink>
        </div>
        <nav class="nav">
          <RouterLink to="/">{{ t('app.home') }}</RouterLink>
          <RouterLink to="/blog">{{ t('app.blog') }}</RouterLink>
          <RouterLink to="/contact">{{ t('app.contact') }}</RouterLink>
          
          <!-- Language selector -->
          <div class="language-selector">
            <label for="language-select">{{ t('language') }}:</label>
            <select id="language-select" v-model="selectedLanguage" @change="changeLanguage">
                <option :value="Language.EN">{{ t('language.en') }}</option>
                <option :value="Language.RU">{{ t('language.ru') }}</option>
            </select>
          </div>
        </nav>
      </div>
   </header>
    <!--main content -->
    <main class="main">
      <div class="container">
        <RouterView />
      </div>
    </main>
    <!--footer -->
    <footer class="footer">
      <div class="container">
        <p>{{ t('app.copyright') }}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.language-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1.5rem;
}

.language-selector select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}

/* Adjust the nav to accommodate the language selector */
.nav {
  display: flex;
  align-items: center;
}
</style>


