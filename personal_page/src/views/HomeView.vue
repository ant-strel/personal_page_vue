<template>
  <div class="home">
    <section class="hero">
          <h1 class="title">{{ t('home.title') }}</h1>
          <p class="subtitle">{{ t('home.subtitle') }}</p>
    </section>
    <section class="featured">
        <h2>{{ t('home.latestPosts') }}</h2>
      <div class="posts-preview">
        <p>{{ t('home.comingSoon') }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();
</script>