<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categories, articles } from '@/data/articles.js'
import CategoryCard from '@/components/CategoryCard.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import AdBanner from '@/components/AdBanner.vue'
import { searchWikipedia } from '@/services/api.js'

const router = useRouter()
const popularArticles = articles.slice(0, 6)
const wikiNews = ref([])
const loading = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  const results = await searchWikipedia('Tattoo art history culture')
  if (results && results.length > 0) {
    wikiNews.value = results.slice(0, 3)
  }
  loading.value = false
})

function doSearch() {
  const q = searchQuery.value.trim()
  if (q) {
    router.push({ name: 'search', query: { q } })
    searchQuery.value = ''
  }
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__content">
          <h1 class="hero__title">Всё о татуировках</h1>
          <p class="hero__subtitle">Стили, уход, материалы, история и вдохновение. Полный гид по миру тату-искусства.</p>
          <div class="hero__actions">
            <router-link :to="{ name: 'catalog' }" class="btn btn-primary">Все статьи</router-link>
            <router-link :to="{ name: 'category', params: { slug: 'types' } }" class="btn btn-outline">Виды тату</router-link>
          </div>
        </div>
        <div class="hero__search">
          <form @submit.prevent="doSearch" class="hero__search-form">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Что вас интересует? Стили, уход, стоимость..."
              class="hero__search-input"
            />
            <button type="submit" class="hero__search-submit">Найти</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Категории</h2>
        <p class="section-subtitle">Выберите тему, которая вас интересует</p>
        <div class="categories-grid">
          <CategoryCard v-for="cat in categories" :key="cat.id" :category="cat" />
        </div>
      </div>
    </section>

    <AdBanner type="banner" />

    <!-- Popular Articles -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Популярные статьи</h2>
        <p class="section-subtitle">Самое читаемое на нашем сайте</p>
        <div class="articles-grid">
          <ArticleCard v-for="article in popularArticles" :key="article.id" :article="article" />
        </div>
        <div class="home__more">
          <router-link :to="{ name: 'catalog' }" class="btn btn-outline">Смотреть все статьи →</router-link>
        </div>
      </div>
    </section>

    <AdBanner type="banner" />

    <!-- Wikipedia Feed -->
    <section class="section" v-if="wikiNews.length > 0">
      <div class="container">
        <h2 class="section-title">Из Википедии</h2>
        <p class="section-subtitle">Интересные факты о татуировках со всего мира</p>
        <div class="wiki-grid">
          <a
            v-for="item in wikiNews"
            :key="item.pageid"
            :href="`https://en.wikipedia.org/?curid=${item.pageid}`"
            target="_blank"
            rel="noopener noreferrer"
            class="card wiki-card"
          >
            <h3 class="wiki-card__title">{{ item.title }}</h3>
            <p class="wiki-card__snippet">{{ item.snippet }}</p>
            <span class="wiki-card__source">Wikipedia →</span>
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent-light) 50%, var(--bg) 100%);
  padding: 64px 0 48px;
  position: relative;
  overflow: hidden;
}

.hero__content {
  max-width: 640px;
}

.hero__title {
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.hero__subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 32px;
}

.hero__actions {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
}

.hero__search-form {
  display: flex;
  gap: 8px;
  max-width: 560px;
}

.hero__search-input {
  flex: 1;
  padding: 14px 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--bg-card);
  outline: none;
  transition: border-color 0.2s;
}

.hero__search-submit {
  padding: 14px 28px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.hero__search-submit:hover {
  background: var(--accent-hover);
}

.section {
  padding: 48px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.home__more {
  text-align: center;
  margin-top: 32px;
}

.wiki-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.wiki-card {
  padding: 24px;
}

.wiki-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.wiki-card__snippet {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
}

.wiki-card__source {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent);
}

@media (max-width: 1024px) {
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .articles-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero { padding: 40px 0 32px; }
  .hero__title { font-size: 2rem; }
  .hero__subtitle { font-size: 1rem; }
  .hero__search-form { flex-direction: column; }
  
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .articles-grid { grid-template-columns: 1fr; }
  .wiki-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .categories-grid { grid-template-columns: 1fr; }
}
</style>
