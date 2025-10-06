<template>
    <div class="contact">
        <section class="hero">
            <h1 class="title">{{ t('contact.title') }}</h1>
            <p class="subtitle">{{ t('contact.subtitle') }}</p>
        </section>
        
        <div class="contact-form">
            
            <div class="contact-info">
                <h3>{{ t('contact.otherWays') }}</h3>
                
                <div class="contact-method">
                    <span class="contact-method-label">Email:</span>
                    <span>your.email@example.com</span>
                </div>
                
                <div class="contact-method">
                    <span class="contact-method-label">LinkedIn:</span>
                    <a href="https://linkedin.com/in/yourprofile" target="_blank">linkedin.com/in/yourprofile</a>
                </div>
                
                <div class="contact-method">
                    <span class="contact-method-label">GitHub:</span>
                    <a href="https://github.com/yourusername" target="_blank">github.com/yourusername</a>
                </div>
            </div>

            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label for="name">{{ t('contact.form.name') }}</label>
                    <input type="text" id="name" v-model="form.name" class="form-control" :placeholder="t('contact.form.namePlaceholder')">
                </div>
                
                <div class="form-group">
                    <label for="email">{{ t('contact.form.email') }}</label>
                    <input type="email" id="email" v-model="form.email" class="form-control" :placeholder="t('contact.form.emailPlaceholder')">
                </div>
                
                <div class="form-group">
                    <label for="message">{{ t('contact.form.message') }}</label>
                    <textarea id="message" v-model="form.message" class="form-control" rows="5" :placeholder="t('contact.form.messagePlaceholder')"></textarea>
                </div>
                
                <div class="submit-wrapper">
                    <button type="submit" class="btn btn-primary">{{ t('contact.form.submit') }}</button>
                </div>
            </form>
            
            
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from '../composables/useI18n';

const { t } = useI18n();

// Form data
const form = reactive({
    name: '',
    email: '',
    message: ''
});

// Form submission
const submitForm = () => {
    console.log('Form submitted:', form);
    // Here you would typically send the data to a backend API
    
    // Reset form after submission
    form.name = '';
    form.email = '';
    form.message = '';
};
</script>