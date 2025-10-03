<script setup lang="ts">
import { RouterView,RouterLink} from 'vue-router'
</script>

<template>
  <div class="layout">
   <!--nav header -->
   <header class="header">
      <div class="app-container">
        <div class="logo">
            <RouterLink to="/">Your Name</RouterLink>
        </div>
        <nav class="nav">
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/blog">Blog</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
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
        <p>&copy; 2025 Your Name. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>


