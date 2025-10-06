<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }
    return ''; // use external default escaping
  }
});

// Props
interface Props {
  content: string;
}

const props = defineProps<Props>();

// Computed properties
const renderedContent = computed(() => {
  return md.render(props.content || '');
});
</script>

<style>
.markdown-content {
  line-height: 1.6;
  overflow-wrap: break-word;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.markdown-content h1 {
  font-size: 2rem;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

.markdown-content h3 {
  font-size: 1.25rem;
}

.markdown-content p,
.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1rem;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 2em;
}

.markdown-content ul {
  list-style-type: disc;
}

.markdown-content ol {
  list-style-type: decimal;
}

.markdown-content blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 1rem;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
}

.markdown-content pre {
  background-color: #f6f8fa;
  border-radius: 3px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 16px;
  margin-bottom: 16px;
}

.markdown-content code {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 85%;
  margin: 0;
  padding: 0.2em 0.4em;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content table {
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}

.markdown-content table th,
.markdown-content table td {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-content table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-content table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-content hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.markdown-content iframe {
  max-width: 100%;
  width: 100%;
  margin: 1.5rem 0;
  border: none;
  aspect-ratio: 16/9;
}

.markdown-content video {
  width: 100%;
  max-width: 100%;
  margin: 1.5rem 0;
  border-radius: 4px;
}

.markdown-content input[type="checkbox"] {
  margin-right: 0.5em;
}

.markdown-content .task-list-item {
  list-style-type: none;
  margin-left: -1.5em;
}

.markdown-content .task-list-item input[type="checkbox"] {
  margin: 0 0.5em 0 0;
  vertical-align: middle;
}
</style>