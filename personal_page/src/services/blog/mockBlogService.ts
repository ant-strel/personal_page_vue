import { BlogServiceInterface } from './blogService.interface';
import { BlogPost, CreatePostData, GetPostsParams, PaginatedResponse, UpdatePostData, LocalizedContent } from './types';
import { Language } from '../../composables/useI18n';

/**
 * Мок-сервис для работы с блогом
 * Использует localStorage для хранения данных
 */
export class MockBlogService implements BlogServiceInterface {
  private readonly STORAGE_KEY = 'blog-posts';
  
  constructor() {
    // Инициализация демо-данных при первом создании экземпляра
    this.initializeDemo();
  }
  
  /**
   * Получение списка статей с пагинацией и фильтрацией
   */
  async getPosts(params: GetPostsParams = {}): Promise<PaginatedResponse<BlogPost>> {
    // Добавим небольшую задержку для имитации сетевого запроса
    await this.delay(300);
    
    // Получаем статьи из localStorage
    const posts = this.getStoredPosts();
    
    // Фильтрация
    let filteredPosts = [...posts];
    
    // Фильтр по опубликованным/неопубликованным
    if (params.published !== undefined) {
      filteredPosts = filteredPosts.filter(post => post.published === params.published);
    }
    
    // Фильтр по автору
    if (params.authorId) {
      filteredPosts = filteredPosts.filter(post => post.authorId === params.authorId);
    }
    
    // Фильтр по языку
    if (params.language) {
      filteredPosts = filteredPosts.filter(post => {
        // Если указан конкретный язык статьи, проверяем его
        if (post.language) {
          return post.language === params.language;
        }
        
        // Для многоязычных статей проверяем наличие перевода
        if (typeof post.title === 'object' && typeof post.content === 'object') {
          return post.title[params.language!] && post.content[params.language!];
        }
        
        // По умолчанию показываем статьи на английском
        return params.language === Language.EN;
      });
    }
    
    // Фильтр по тегу
    if (params.tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags && post.tags.includes(params.tag!)
      );
    }
    
    // Поиск по тексту (в заголовке и содержимом)
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => {
        // Для локализованного контента ищем в текущем языке
        let titleText = '';
        let contentText = '';
        
        if (typeof post.title === 'object') {
          titleText = (post.title[params.language || Language.EN] || '').toLowerCase();
        } else {
          titleText = post.title.toLowerCase();
        }
        
        if (typeof post.content === 'object') {
          contentText = (post.content[params.language || Language.EN] || '').toLowerCase();
        } else {
          contentText = post.content.toLowerCase();
        }
        
        return titleText.includes(searchLower) || contentText.includes(searchLower);
      });
    }
    
    // Сортировка от новых к старым
    filteredPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Пагинация
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
    
    return {
      items: paginatedPosts,
      total: filteredPosts.length,
      page,
      limit,
      totalPages: Math.ceil(filteredPosts.length / limit),
      hasMore: endIndex < filteredPosts.length
    };
  }
  
  /**
   * Получение одной статьи по ID или slug
   */
  async getPost(idOrSlug: string): Promise<BlogPost | null> {
    await this.delay(200);
    
    const posts = this.getStoredPosts();
    
    // Пытаемся найти по ID или slug
    const post = posts.find(p => 
      p.id === idOrSlug || p.slug === idOrSlug
    );
    
    return post || null;
  }
  
  /**
   * Создание новой статьи
   */
  async createPost(postData: CreatePostData): Promise<BlogPost> {
    await this.delay(500);
    
    const posts = this.getStoredPosts();
    
    // Создаем новую статью
    const newPost: BlogPost = {
      id: this.generateId(),
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || (typeof postData.content === 'string' ? this.generateExcerpt(postData.content) : undefined),
      slug: this.generateSlug(typeof postData.title === 'string' ? postData.title : this.getDefaultTitle(postData.title)),
      author: 'Admin User', // В моке используем фиксированного автора
      authorId: '1', // ID автора в моке
      createdAt: new Date(),
      updatedAt: new Date(),
      published: postData.published !== undefined ? postData.published : false,
      tags: postData.tags || [],
      language: postData.language
    };
    
    // Добавляем статью в список
    posts.push(newPost);
    
    // Сохраняем обновленный список
    this.storePostsToLocalStorage(posts);
    
    return newPost;
  }
  
  /**
   * Обновление существующей статьи
   */
  async updatePost(id: string, postData: UpdatePostData): Promise<BlogPost | null> {
    await this.delay(500);
    
    const posts = this.getStoredPosts();
    
    // Ищем индекс статьи по ID
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Получаем текущую статью
    const post = posts[index];
    
    // Создаем новый slug, если обновлен заголовок
    let slug = post.slug;
    if (postData.title) {
      slug = this.generateSlug(
        typeof postData.title === 'string' 
          ? postData.title 
          : this.getDefaultTitle(postData.title)
      );
    }
    
    // Создаем excerpt, если его нет и обновлен контент
    let excerpt = postData.excerpt || post.excerpt;
    if (!excerpt && postData.content && typeof postData.content === 'string') {
      excerpt = this.generateExcerpt(postData.content);
    }
    
    // Обновляем поля
    const updatedPost: BlogPost = {
      ...post,
      ...postData,
      slug,
      excerpt,
      updatedAt: new Date()
    };
    
    // Обновляем статью в списке
    posts[index] = updatedPost;
    
    // Сохраняем обновленный список
    this.storePostsToLocalStorage(posts);
    
    return updatedPost;
  }
  
  /**
   * Инициализация демо-данных
   * Добавляет примеры статей в localStorage, если их нет
   */
  private initializeDemo(): void {
    if (localStorage.getItem(this.STORAGE_KEY)) {
      // Данные уже есть, не перезаписываем
      return;
    }
    
    const demoPosts: BlogPost[] = [
      // Двуязычная статья
      {
        id: '1',
        title: {
          [Language.EN]: 'Getting Started with Vue 3 and TypeScript',
          [Language.RU]: 'Начало работы с Vue 3 и TypeScript'
        },
        content: {
          [Language.EN]: `Vue 3 with TypeScript offers a powerful developer experience. This combination allows you to build robust web applications with type safety and powerful tooling.

In this article, we'll explore how to set up a Vue 3 project with TypeScript and discover some of the benefits this combination brings.

## Setting up a Vue 3 Project with TypeScript

First, you'll need to create a new Vue 3 project using the Vue CLI:

\`\`\`bash
npm init vue@latest
\`\`\`

During the setup, make sure to select TypeScript as an option. Once installed, you can start developing your app with full TypeScript support.

## Benefits of Using TypeScript with Vue 3

TypeScript brings several advantages to Vue development:

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Better IDE Support**: Enjoy autocomplete and intelligent suggestions
3. **Improved Refactoring**: Safely rename variables and functions across your codebase
4. **Better Documentation**: Types serve as documentation for your code

## Conclusion

Vue 3 and TypeScript create a powerful combination that can significantly improve your development workflow. With type checking, better IDE support, and a more maintainable codebase, you'll be able to build more robust applications with fewer bugs.`,
          [Language.RU]: `Vue 3 с TypeScript предлагает мощный опыт разработки. Эта комбинация позволяет создавать надежные веб-приложения с типобезопасностью и мощными инструментами.

В этой статье мы рассмотрим, как настроить проект Vue 3 с TypeScript и узнаем о некоторых преимуществах, которые дает эта комбинация.

## Настройка проекта Vue 3 с TypeScript

Сначала вам нужно создать новый проект Vue 3 с помощью Vue CLI:

\`\`\`bash
npm init vue@latest
\`\`\`

Во время настройки обязательно выберите TypeScript как опцию. После установки вы можете начать разрабатывать ваше приложение с полной поддержкой TypeScript.

## Преимущества использования TypeScript с Vue 3

TypeScript привносит несколько преимуществ в разработку Vue:

1. **Типобезопасность**: Обнаружение ошибок во время компиляции, а не во время выполнения
2. **Лучшая поддержка IDE**: Автозаполнение и интеллектуальные подсказки
3. **Улучшенный рефакторинг**: Безопасное переименование переменных и функций в вашей кодовой базе
4. **Лучшая документация**: Типы служат документацией для вашего кода

## Заключение

Vue 3 и TypeScript создают мощную комбинацию, которая может значительно улучшить ваш процесс разработки. С проверкой типов, лучшей поддержкой IDE и более поддерживаемой кодовой базой вы сможете создавать более надежные приложения с меньшим количеством ошибок.`
        },
        excerpt: {
          [Language.EN]: 'Learn how to combine Vue 3 with TypeScript for a better development experience with improved type safety and tooling.',
          [Language.RU]: 'Узнайте, как объединить Vue 3 с TypeScript для лучшего опыта разработки с улучшенной безопасностью типов и инструментами.'
        },
        slug: 'getting-started-with-vue3-and-typescript',
        author: 'John Doe',
        authorId: '1',
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2023-01-15'),
        published: true,
        tags: ['Vue.js', 'TypeScript', 'Web Development']
      },
      // Одноязычные статьи (английский)
      {
        id: '2',
        title: 'Building Responsive UIs with CSS Grid',
        content: `CSS Grid is a powerful layout system available in CSS. It's a 2-dimensional system, meaning it can handle both columns and rows, unlike flexbox which is largely a 1-dimensional system. You work with CSS Grid by applying CSS rules both to a parent element (which becomes the Grid Container) and to that element's children (which become Grid Items).

## Getting Started with CSS Grid

To create a grid container, you set the display property to grid:

\`\`\`css
.container {
  display: grid;
}
\`\`\`

Then you can define your grid columns and rows:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 20px;
}
\`\`\`

This creates a three-column grid with automatically sized rows and a 20px gap between grid items.

## Creating Responsive Layouts

One of the most powerful features of CSS Grid is how easily it adapts to different screen sizes. Using minmax() and repeat(), you can create responsive layouts without media queries:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
\`\`\`

This creates a grid where each column is at least 300px wide, and the browser will fit as many columns as it can into the available space.

## Conclusion

CSS Grid makes it easy to create complex, responsive layouts with clean, semantic HTML. Combined with media queries for fine-tuning, CSS Grid gives you unprecedented control over your webpage layouts.`,
        slug: 'building-responsive-uis-with-css-grid',
        author: 'Sarah Johnson',
        authorId: '2',
        createdAt: new Date('2023-02-20'),
        updatedAt: new Date('2023-02-25'),
        published: true,
        language: Language.EN,
        tags: ['CSS', 'Web Design', 'Responsive Design']
      },
      // Русскоязычная статья
      {
        id: '3',
        title: 'Основы React Hooks',
        content: `React Hooks — это функции, которые позволяют использовать состояние и другие возможности React без написания классовых компонентов. Они были представлены в React 16.8 и полностью изменили способ написания компонентов.

## Базовые хуки

### useState
\`useState\` позволяет добавлять состояние в функциональные компоненты:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Счётчик: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Увеличить
      </button>
    </div>
  );
}
\`\`\`

### useEffect
\`useEffect\` позволяет выполнять побочные эффекты в функциональных компонентах:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Вы нажали \${count} раз\`;
  });

  return (
    <div>
      <p>Вы нажали {count} раз</p>
      <button onClick={() => setCount(count + 1)}>
        Нажмите меня
      </button>
    </div>
  );
}
\`\`\`

## Преимущества React Hooks

1. **Более чистый код**: Hooks позволяют избавиться от сложной иерархии компонентов и использовать состояние без классов.
2. **Повторное использование логики**: Собственные хуки позволяют повторно использовать логику состояния между компонентами.
3. **Более понятная организация кода**: Hooks помогают группировать связанный код вместе, что делает его более понятным.

## Заключение

React Hooks — это мощный инструмент для разработки React приложений. Они упрощают код, делают его более читаемым и позволяют легко повторно использовать логику между компонентами.`,
        slug: 'osnovy-react-hooks',
        author: 'Иван Петров',
        authorId: '3',
        createdAt: new Date('2023-03-10'),
        updatedAt: new Date('2023-03-15'),
        published: true,
        language: Language.RU,
        tags: ['React', 'JavaScript', 'Web Development']
      },
      // Еще одна двуязычная статья
      {
        id: '4',
        title: {
          [Language.EN]: 'Introduction to State Management with Vuex',
          [Language.RU]: 'Введение в управление состоянием с Vuex'
        },
        content: {
          [Language.EN]: `Vuex is a state management pattern + library for Vue.js applications. It serves as a centralized store for all the components in an application, with rules ensuring that the state can only be mutated in a predictable fashion.

## Why Use Vuex?

As your application grows, managing state across components becomes challenging. Vuex provides a structured solution that helps maintain a clear data flow:

1. **Centralized State**: All application data in one place
2. **Predictable State Changes**: Mutations happen through explicit commits
3. **Debugging Capabilities**: Time-travel debugging with Vue Devtools
4. **Organized Architecture**: Clear separation of concerns

## Core Concepts

Vuex has several core concepts:

### State
The single source of truth that holds all your application-level data.

\`\`\`js
const state = {
  count: 0,
  todos: []
}
\`\`\`

### Getters
Like computed properties for stores - they calculate derived state.

\`\`\`js
const getters = {
  completedTodos: state => {
    return state.todos.filter(todo => todo.completed)
  }
}
\`\`\`

### Mutations
The only way to change state in a Vuex store.

\`\`\`js
const mutations = {
  increment(state, payload) {
    state.count += payload.amount
  }
}
\`\`\`

### Actions
Similar to mutations, but actions can contain asynchronous operations.

\`\`\`js
const actions = {
  fetchTodos({ commit }) {
    return api.getTodos().then(todos => {
      commit('setTodos', todos)
    })
  }
}
\`\`\`

## Conclusion

Vuex offers a robust solution for state management in Vue applications. While it adds some complexity, the benefits of maintainability, predictability, and debugging capabilities make it worthwhile for medium to large applications.`,
          [Language.RU]: `Vuex — это паттерн и библиотека управления состоянием для приложений Vue.js. Он служит централизованным хранилищем для всех компонентов в приложении, с правилами, обеспечивающими изменение состояния только предсказуемым образом.

## Зачем использовать Vuex?

По мере роста вашего приложения управление состоянием между компонентами становится сложной задачей. Vuex предлагает структурированное решение, которое помогает поддерживать четкий поток данных:

1. **Централизованное состояние**: Все данные приложения в одном месте
2. **Предсказуемые изменения состояния**: Мутации происходят через явные коммиты
3. **Возможности отладки**: Отладка с путешествием во времени с помощью Vue Devtools
4. **Организованная архитектура**: Четкое разделение обязанностей

## Основные концепции

Vuex имеет несколько основных концепций:

### State (Состояние)
Единый источник истины, который содержит все данные уровня приложения.

\`\`\`js
const state = {
  count: 0,
  todos: []
}
\`\`\`

### Getters (Геттеры)
Как вычисляемые свойства для хранилищ — они вычисляют производное состояние.

\`\`\`js
const getters = {
  completedTodos: state => {
    return state.todos.filter(todo => todo.completed)
  }
}
\`\`\`

### Mutations (Мутации)
Единственный способ изменить состояние в хранилище Vuex.

\`\`\`js
const mutations = {
  increment(state, payload) {
    state.count += payload.amount
  }
}
\`\`\`

### Actions (Действия)
Похожи на мутации, но действия могут содержать асинхронные операции.

\`\`\`js
const actions = {
  fetchTodos({ commit }) {
    return api.getTodos().then(todos => {
      commit('setTodos', todos)
    })
  }
}
\`\`\`

## Заключение

Vuex предлагает надежное решение для управления состоянием в приложениях Vue. Хотя он добавляет некоторую сложность, преимущества в плане сопровождаемости, предсказуемости и возможностей отладки делают его полезным для средних и крупных приложений.`
        },
        excerpt: {
          [Language.EN]: 'Learn how to manage state in Vue applications using Vuex for better organization and maintainability.',
          [Language.RU]: 'Узнайте, как управлять состоянием в приложениях Vue с помощью Vuex для лучшей организации и поддерживаемости.'
        },
        slug: 'introduction-to-state-management-with-vuex',
        author: 'Alex Chen',
        authorId: '1',
        createdAt: new Date('2023-04-05'),
        updatedAt: new Date('2023-04-10'),
        published: true,
        tags: ['Vue.js', 'Vuex', 'State Management']
      }
    ];
    
    // Сохраняем демо-данные в localStorage
    this.storePostsToLocalStorage(demoPosts);
  }
  
  /**
   * Получает заголовок по умолчанию (для английского языка)
   * или первый доступный заголовок из локализованного контента
   */
  private getDefaultTitle(title: string | LocalizedContent): string {
    if (typeof title === 'string') {
      return title;
    }
    
    // Сначала пробуем английский
    if (title[Language.EN]) {
      return title[Language.EN];
    }
    
    // Берем первый доступный заголовок
    const availableTitle = Object.values(title).find(t => !!t);
    return availableTitle || 'Untitled Post';
  }
  
  /**
   * Удаление статьи
   */
  async deletePost(id: string): Promise<boolean> {
    await this.delay(300);
    
    const posts = this.getStoredPosts();
    
    // Ищем индекс статьи по ID
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return false;
    }
    
    // Удаляем статью из списка
    posts.splice(index, 1);
    
    // Сохраняем обновленный список
    this.storePostsToLocalStorage(posts);
    
    return true;
  }
  
  /**
   * Получение всех уникальных тегов из статей
   */
  async getTags(): Promise<string[]> {
    await this.delay(200);
    
    const posts = this.getStoredPosts();
    
    // Собираем все теги из статей
    const allTags: string[] = [];
    posts.forEach(post => {
      if (post.tags && post.tags.length > 0) {
        allTags.push(...post.tags);
      }
    });
    
    // Возвращаем уникальные теги
    return [...new Set(allTags)];
  }
  
  /**
   * Вспомогательный метод для имитации задержки сетевых запросов
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Получение списка статей из localStorage
   */
  private getStoredPosts(): BlogPost[] {
    const postsJson = localStorage.getItem(this.STORAGE_KEY);
    
    if (!postsJson) {
      // Если статей нет, возвращаем пустой массив
      return [];
    }
    
    try {
      // Парсим JSON и преобразуем строковые даты в объекты Date
      const posts = JSON.parse(postsJson);
      return posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined
      }));
    } catch (e) {
      console.error('Ошибка при чтении статей из localStorage:', e);
      return [];
    }
  }
  
  /**
   * Сохранение списка статей в localStorage
   */
  private storePostsToLocalStorage(posts: BlogPost[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Ошибка при сохранении статей в localStorage:', e);
    }
  }
  
  /**
   * Генерация уникального ID для статьи
   */
  private generateId(): string {
    return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
  }
  
  /**
   * Генерация слага из заголовка
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/--+/g, '-');
  }
  
  /**
   * Генерация отрывка из контента
   */
  private generateExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Обрезаем контент до максимальной длины и добавляем многоточие
    return content.substring(0, maxLength).trim() + '...';
  }
}