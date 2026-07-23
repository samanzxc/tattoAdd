<script setup>
import { computed } from 'vue'
import { getCategoryBySlug } from '@/data/articles.js'

const props = defineProps({
  article: { type: Object, required: true }
})

const category = computed(() => getCategoryBySlug(props.article.category))
</script>

<template>
  <router-link
    :to="{ name: 'article', params: { slug: article.id } }"
    class="card article-card"
    :style="{
      '--card-accent': category?.color || 'var(--accent)'
    }"
  >
    <div class="article-card__bg-icon">✦</div>
    <div class="article-card__body">
      <div class="article-card__meta">
        <span class="tag" :style="{ background: category?.color + '25', color: category?.color }">
          {{ category?.name }}
        </span>
        <span class="article-card__time">{{ article.readTime }} мин чтения</span>
      </div>
      <h3 class="article-card__title">{{ article.title }}</h3>
      <p class="article-card__excerpt">{{ article.excerpt }}</p>
      <span class="article-card__link">Читать далее →</span>
    </div>
  </router-link>
</template>

<style scoped>
.article-card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--hero-fallback-2) 0%, var(--hero-fallback-1) 100%);
  border: 1px solid rgba(255,255,255,0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(255,255,255,0.12);
}

.article-card__bg-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12rem;
  line-height: 1;
  color: var(--card-accent);
  opacity: 0.06;
  pointer-events: none;
  user-select: none;
}

.article-card__body {
  position: relative;
  z-index: 1;
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.article-card__time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.article-card__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  color: #fff;
}

.article-card__excerpt {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-card__link {
  margin-top: 16px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  transition: opacity 0.2s ease;
}

.article-card:hover .article-card__link {
  gap: 6px;
}
</style>
