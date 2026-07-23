<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryBySlug, getArticlesByCategory } from '@/data/articles.js'
import ArticleCard from '@/components/ArticleCard.vue'
import AdBanner from '@/components/AdBanner.vue'

const route = useRoute()

const category = computed(() => getCategoryBySlug(route.params.slug))
const articles = computed(() => getArticlesByCategory(route.params.slug))
</script>

<template>
  <div class="category-page">
    <div class="container" v-if="category">
      <div class="category-page__header">
        <div class="category-page__icon" :style="{ background: category.color + '18' }">
          <span>{{ category.icon }}</span>
        </div>
        <h1 class="section-title">{{ category.name }}</h1>
        <p class="section-subtitle">{{ category.description }} · {{ articles.length }} статей</p>
      </div>

      <AdBanner type="banner" />

      <div class="category-page__grid" v-if="articles.length > 0">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      </div>
      <div class="category-page__empty" v-else>
        <p>Статьи в этой категории скоро появятся</p>
      </div>
    </div>
    <div class="container" v-else>
      <div class="category-page__empty">
        <p>Категория не найдена</p>
        <router-link :to="{ name: 'catalog' }" class="btn btn-outline" style="margin-top:16px">← Все категории</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-page {
  padding: 40px 0;
}

.category-page__header {
  margin-bottom: 32px;
}

.category-page__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 16px;
}

.category-page__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.category-page__empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .category-page__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .category-page__grid { grid-template-columns: 1fr; }
}
</style>
