import { ref, computed, readonly, watch } from 'vue';

// Языки, поддерживаемые приложением
export enum Language {
  RU = 'ru',
  EN = 'en'
}

// Интерфейс для локализованной строки
export interface TranslationEntry {
  [Language.RU]: string;
  [Language.EN]: string;
}

// Интерфейс для всех локализованных строк
export interface Translations {
  [key: string]: TranslationEntry;
}

// Все переводы приложения
const translations: Translations = {
  // Общие элементы интерфейса
  'app.home': {
    [Language.RU]: 'Главная',
    [Language.EN]: 'Home'
  },
  'app.blog': {
    [Language.RU]: 'Блог',
    [Language.EN]: 'Blog'
  },
  'app.contact': {
    [Language.RU]: 'Контакты',
    [Language.EN]: 'Contact'
  },
  'app.admin': {
    [Language.RU]: 'Администрирование',
    [Language.EN]: 'Admin'
  },
  
  // Блог
  'blog.title': {
    [Language.RU]: 'Блог',
    [Language.EN]: 'Blog'
  },
  'blog.subtitle': {
    [Language.RU]: 'Мысли, идеи и обновления',
    [Language.EN]: 'Thoughts, ideas, and updates'
  },
  'blog.loading': {
    [Language.RU]: 'Загрузка статей...',
    [Language.EN]: 'Loading posts...'
  },
  'blog.noPosts': {
    [Language.RU]: 'На данный момент статей нет. Загляните позже!',
    [Language.EN]: 'No posts available at the moment. Check back soon!'
  },
  'blog.continueReading': {
    [Language.RU]: 'Читать далее →',
    [Language.EN]: 'Continue reading →'
  },
  'blog.previous': {
    [Language.RU]: 'Предыдущая',
    [Language.EN]: 'Previous'
  },
  'blog.next': {
    [Language.RU]: 'Следующая',
    [Language.EN]: 'Next'
  },
  'blog.tags': {
    [Language.RU]: 'Теги:',
    [Language.EN]: 'Tags:'
  },
  
  // Просмотр статьи
  'blogPost.loading': {
    [Language.RU]: 'Загрузка статьи...',
    [Language.EN]: 'Loading post...'
  },
  'blogPost.error': {
    [Language.RU]: 'Ошибка',
    [Language.EN]: 'Error'
  },
  'blogPost.notFound': {
    [Language.RU]: 'Статья не найдена',
    [Language.EN]: 'Post Not Found'
  },
  'blogPost.notFoundMessage': {
    [Language.RU]: 'Статья, которую вы ищете, не существует или была удалена.',
    [Language.EN]: 'The blog post you\'re looking for doesn\'t exist or has been removed.'
  },
  'blogPost.backToBlog': {
    [Language.RU]: '← Вернуться к блогу',
    [Language.EN]: '← Back to all posts'
  },
  'blogPost.by': {
    [Language.RU]: 'Автор:',
    [Language.EN]: 'By'
  },
  
  // Редактор блога
  'blogEditor.title': {
    [Language.RU]: 'Редактор блога',
    [Language.EN]: 'Blog Editor'
  },
  'blogEditor.posts': {
    [Language.RU]: 'Статьи',
    [Language.EN]: 'Posts'
  },
  'blogEditor.createNew': {
    [Language.RU]: 'Создать новую статью',
    [Language.EN]: 'Create New Post'
  },
  'blogEditor.noPosts': {
    [Language.RU]: 'Статей не найдено. Создайте свою первую статью!',
    [Language.EN]: 'No posts found. Create your first post!'
  },
  'blogEditor.selectPost': {
    [Language.RU]: 'Выберите статью для редактирования или создайте новую',
    [Language.EN]: 'Select a post to edit or create a new one'
  },
  'blogEditor.title.label': {
    [Language.RU]: 'Заголовок',
    [Language.EN]: 'Title'
  },
  'blogEditor.title.placeholder': {
    [Language.RU]: 'Введите заголовок статьи',
    [Language.EN]: 'Enter post title'
  },
  'blogEditor.slug.label': {
    [Language.RU]: 'Ссылка (URL)',
    [Language.EN]: 'Slug (URL)'
  },
  'blogEditor.slug.placeholder': {
    [Language.RU]: 'url-statji',
    [Language.EN]: 'post-url-slug'
  },
  'blogEditor.slug.help': {
    [Language.RU]: 'Оставьте пустым для автоматической генерации из заголовка',
    [Language.EN]: 'Leave empty to auto-generate from title'
  },
  'blogEditor.excerpt.label': {
    [Language.RU]: 'Краткое описание',
    [Language.EN]: 'Excerpt (Summary)'
  },
  'blogEditor.excerpt.placeholder': {
    [Language.RU]: 'Краткое описание статьи...',
    [Language.EN]: 'Brief description of your post...'
  },
  'blogEditor.content.label': {
    [Language.RU]: 'Содержимое',
    [Language.EN]: 'Content'
  },
  'blogEditor.content.placeholder': {
    [Language.RU]: 'Напишите текст статьи здесь...',
    [Language.EN]: 'Write your post content here...'
  },
  'blogEditor.language.label': {
    [Language.RU]: 'Язык статьи',
    [Language.EN]: 'Post Language'
  },
  'blogEditor.tags.label': {
    [Language.RU]: 'Теги',
    [Language.EN]: 'Tags'
  },
  'blogEditor.tags.placeholder': {
    [Language.RU]: 'Добавьте тег и нажмите Enter',
    [Language.EN]: 'Add a tag and press Enter'
  },
  'blogEditor.tags.add': {
    [Language.RU]: 'Добавить',
    [Language.EN]: 'Add'
  },
  'blogEditor.tags.available': {
    [Language.RU]: 'Доступные теги:',
    [Language.EN]: 'Available tags:'
  },
  'blogEditor.publish': {
    [Language.RU]: 'Опубликовать эту статью',
    [Language.EN]: 'Publish this post'
  },
  'blogEditor.language': {
    [Language.RU]: 'Язык статьи',
    [Language.EN]: 'Post Language'
  },
  'blogEditor.multilingual': {
    [Language.RU]: 'Многоязычный',
    [Language.EN]: 'Multilingual'
  },
  'blogEditor.untitled': {
    [Language.RU]: '[Без заголовка]',
    [Language.EN]: '[Untitled]'
  },
  'blogEditor.titlePlaceholder': {
    [Language.RU]: 'Введите заголовок статьи',
    [Language.EN]: 'Enter post title'
  },
  'blogEditor.excerptPlaceholder': {
    [Language.RU]: 'Краткое описание статьи...',
    [Language.EN]: 'Brief description of your post...'
  },
  'blogEditor.contentPlaceholder': {
    [Language.RU]: 'Напишите текст статьи здесь...',
    [Language.EN]: 'Write your post content here...'
  },
  'blogEditor.slug': {
    [Language.RU]: 'Ссылка (URL)',
    [Language.EN]: 'Slug (URL)'
  },
  'blogEditor.slugHelp': {
    [Language.RU]: 'Оставьте пустым для автоматической генерации из заголовка',
    [Language.EN]: 'Leave empty to auto-generate from title'
  },
  'blogEditor.fieldTitle': {
    [Language.RU]: 'Заголовок',
    [Language.EN]: 'Title'
  },
  'blogEditor.fieldExcerpt': {
    [Language.RU]: 'Краткое описание',
    [Language.EN]: 'Excerpt (Summary)'
  },
  'blogEditor.fieldContent': {
    [Language.RU]: 'Содержимое',
    [Language.EN]: 'Content'
  },
  'blogEditor.error.save': {
    [Language.RU]: 'Произошла ошибка при сохранении статьи',
    [Language.EN]: 'An error occurred while saving the post'
  },
  'blogEditor.error.noLanguage': {
    [Language.RU]: 'Для многоязычной статьи нужно заполнить заголовок и содержимое хотя бы на одном языке',
    [Language.EN]: 'For multilingual post, you need to fill in the title and content in at least one language'
  },
  'blogEditor.save': {
    [Language.RU]: 'Сохранить',
    [Language.EN]: 'Save'
  },
  'blogEditor.cancel': {
    [Language.RU]: 'Отмена',
    [Language.EN]: 'Cancel'
  },
  'blogEditor.delete': {
    [Language.RU]: 'Удалить',
    [Language.EN]: 'Delete'
  },
  'blogEditor.draft': {
    [Language.RU]: 'Черновик',
    [Language.EN]: 'Draft'
  },
  
  // Контакты
  'contact.title': {
    [Language.RU]: 'Свяжитесь со мной',
    [Language.EN]: 'Contact Me'
  },
  
  // Админ
  'admin.login': {
    [Language.RU]: 'Вход',
    [Language.EN]: 'Login'
  },
  'admin.logout': {
    [Language.RU]: 'Выйти',
    [Language.EN]: 'Logout'
  },
  'admin.username': {
    [Language.RU]: 'Имя пользователя',
    [Language.EN]: 'Username'
  },
  'admin.password': {
    [Language.RU]: 'Пароль',
    [Language.EN]: 'Password'
  },
  
  // Общие сообщения
  'error.required': {
    [Language.RU]: 'Обязательное поле',
    [Language.EN]: 'This field is required'
  },
  'language': {
    [Language.RU]: 'Язык',
    [Language.EN]: 'Language'
  },
  'language.ru': {
    [Language.RU]: 'Русский',
    [Language.EN]: 'Russian'
  },
  'language.en': {
    [Language.RU]: 'Английский',
    [Language.EN]: 'English'
  },
};

// Определение текущего языка
const currentLanguage = ref<Language>(Language.EN); // По умолчанию английский

// Функция для получения локализации
const t = (key: string): string => {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  return translations[key][currentLanguage.value] || translations[key][Language.EN]; // Fallback на английский
};

// Сохранение выбранного языка в localStorage
const saveLanguagePreference = (lang: Language) => {
  try {
    localStorage.setItem('preferredLanguage', lang);
  } catch (e) {
    console.error('Could not save language preference:', e);
  }
};

// Загрузка предпочтительного языка из localStorage
const loadLanguagePreference = (): Language => {
  try {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && Object.values(Language).includes(savedLanguage as Language)) {
      return savedLanguage as Language;
    }
  } catch (e) {
    console.error('Could not load language preference:', e);
  }
  return Language.EN; // По умолчанию английский
};

// Инициализация языковых настроек
const initializeLanguage = () => {
  currentLanguage.value = loadLanguagePreference();
};

// Смена языка
const setLanguage = (lang: Language) => {
  currentLanguage.value = lang;
  saveLanguagePreference(lang);
};

// Экспортируем композабл для использования в компонентах
export function useI18n() {
  // Инициализируем язык при первом вызове композабла
  initializeLanguage();
  
  return {
    currentLanguage: readonly(currentLanguage),
    t,
    setLanguage,
    Language
  };
}