<script setup>
import { ref, computed } from 'vue'
import { categories, articles } from '@/data/articles.js'
import ArticleCard from '@/components/ArticleCard.vue'
import AdBanner from '@/components/AdBanner.vue'

const activeCategory = ref('all')

const filteredArticles = computed(() => {
  if (activeCategory.value === 'all') return articles
  return articles.filter(a => a.category === activeCategory.value)
})
</script>

<template>
  <div class="catalog">
    <div class="container">
      <div class="catalog__header">
        <h1 class="section-title">Все статьи</h1>
        <p class="section-subtitle">{{ articles.length }} статей о татуировках</p>
      </div>

      <div class="catalog__tabs">
        <button
          class="catalog__tab"
          :class="{ 'catalog__tab--active': activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >Все</button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="catalog__tab"
          :class="{ 'catalog__tab--active': activeCategory === cat.slug }"
          @click="activeCategory = cat.slug"
        >{{ cat.name }}</button>
      </div>

      <AdBanner type="banner" />

      <div class="catalog__grid" v-if="filteredArticles.length > 0">
        <ArticleCard v-for="article in filteredArticles" :key="article.id" :article="article" />
      </div>
      <div class="catalog__empty" v-else>
        <p>В этой категории пока нет статей</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.catalog {
  padding: 40px 0;
}

.catalog__header {
  margin-bottom: 32px;
}

.catalog__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
}

.catalog__tab {
  padding: 8px 18px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary);
  font-family: inherit;
}

.catalog__tab:hover {
  border-color: var(--accent);
}

.catalog__tab--active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.catalog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.catalog__empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .catalog__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .catalog__grid { grid-template-columns: 1fr; }
}
</style>
