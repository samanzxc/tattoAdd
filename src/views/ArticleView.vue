<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleBySlug, getCategoryBySlug, articles } from '@/data/articles.js'
import { fetchWikipediaSummary } from '@/services/api.js'
import { fetchPinterestImages } from '@/services/imageFetcher.js'
import { useArticleParser } from '@/composables/useArticleParser.js'
import AdBanner from '@/components/AdBanner.vue'

const route = useRoute()
const article = computed(() => getArticleBySlug(route.params.slug))
const wikiData = ref(null)
const wikiLoading = ref(true)
const galleryImages = ref([])
const galleryLoading = ref(true)
const imgFailed = ref(false)
const readingProgress = ref(0)
const activeSection = ref('')
const showToc = ref(false)
const articleContent = computed(() => article.value?.content || '')
const { renderHTML, sections } = useArticleParser(articleContent)
const articleCategory = computed(() => article.value ? getCategoryBySlug(article.value.category) : null)

const relatedArticles = computed(() => {
  if (!article.value) return []
  return articles
    .filter(a => a.category === article.value.category && a.id !== article.value.id)
    .slice(0, 3)
})

function loadArticleData(slug) {
  const art = getArticleBySlug(slug)
  wikiData.value = null
  wikiLoading.value = true
  galleryImages.value = []
  galleryLoading.value = true
  imgFailed.value = false
  readingProgress.value = 0
  activeSection.value = ''
  showToc.value = false

  if (art?.wikiTerm) {
    const summaryPromise = fetchWikipediaSummary(art.wikiTerm)
    const galleryPromise = fetchPinterestImages(art.wikiTerm + ' tattoo', 8)

    summaryPromise.then(function(s) { if (s) wikiData.value = s }).finally(function() { wikiLoading.value = false })
    galleryPromise.then(function(imgs) { if (imgs && imgs.length > 0) galleryImages.value = imgs }).finally(function() { galleryLoading.value = false })
  } else {
    wikiLoading.value = false
    galleryLoading.value = false
  }
}

watch(function() { return route.params.slug }, function(newSlug) {
  if (newSlug) loadArticleData(newSlug)
})

onMounted(function() {
  loadArticleData(route.params.slug)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(function() {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  const articleEl = document.querySelector('.article-page__main')
  if (!articleEl) return
  const rect = articleEl.getBoundingClientRect()
  const total = articleEl.scrollHeight - window.innerHeight
  const current = -rect.top
  readingProgress.value = Math.min(100, Math.max(0, (current / total) * 100))

  const headings = articleEl.querySelectorAll('.article-section')
  let currentSection = ''
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= 120) {
      currentSection = h.textContent
    }
  }
  activeSection.value = currentSection
}

function scrollToSection(text) {
  const headings = document.querySelectorAll('.article-section')
  for (const h of headings) {
    if (h.textContent === text) {
      h.scrollIntoView({ behavior: 'smooth', block: 'start' })
      break
    }
  }
}

const renderedContent = computed(() => renderHTML())
</script>

<template>
  <div class="article-page" v-if="article">
    <div class="progress-bar" :style="{ width: readingProgress + '%' }"></div>

    <div class="container">
      <div class="article-page__layout">
        <article class="article-page__main" itemscope itemtype="https://schema.org/Article">
          <!-- Hero -->
          <div class="article-hero">
            <div class="article-hero__image" v-if="article.image && !imgFailed">
              <img :src="article.image" :alt="article.title" @error="imgFailed = true" />
            </div>
            <div class="article-hero__image article-hero__image--fallback" v-else>
              <div class="article-hero__placeholder">✦</div>
            </div>
            <div class="article-hero__content">
              <div class="article-hero__meta">
                  <router-link
                    :to="{ name: 'category', params: { slug: article.category } }"
                    class="article-hero__category"
                  >{{ articleCategory?.name || article.category }}</router-link>
                <span class="article-hero__divider">·</span>
                <span class="article-hero__time">{{ article.readTime }} мин чтения</span>
              </div>
              <h1 class="article-hero__title" itemprop="headline">{{ article.title }}</h1>
              <p class="article-hero__lead">{{ article.excerpt }}</p>
            </div>
          </div>

          <!-- TOC trigger -->
          <button class="toc-toggle" @click="showToc = !showToc" v-if="sections.length > 0">
            📑 Содержание
            <span class="toc-toggle__arrow" :class="{ 'toc-toggle__arrow--open': showToc }">▼</span>
          </button>
          <nav class="toc" v-if="showToc && sections.length > 0">
            <button
              v-for="sec in sections"
              :key="sec"
              class="toc__item"
              :class="{ 'toc__item--active': activeSection === sec }"
              @click="scrollToSection(sec); showToc = false"
            >{{ sec }}</button>
          </nav>

          <!-- Article body -->
          <div class="article-body" v-html="renderedContent"></div>

          <!-- Pinterest gallery -->
          <div class="article-gallery" v-if="galleryImages.length > 0">
            <h3 class="article-gallery__title">Изображения по теме</h3>
            <div class="article-gallery__grid">
              <a
                v-for="(img, i) in galleryImages"
                :key="i"
                :href="img.link"
                target="_blank"
                rel="noopener noreferrer"
                class="article-gallery__item"
              >
                <img :src="img.src" :alt="img.alt" loading="lazy" @error="$event.target.style.display='none'" />
                <span class="article-gallery__caption">{{ img.caption }}</span>
              </a>
            </div>
          </div>

          <AdBanner type="banner" />

          <!-- Wikipedia info -->
          <div class="wiki-block" v-if="wikiData && !wikiLoading">
            <div class="wiki-block__icon">📖</div>
            <div class="wiki-block__body">
              <h3 class="wiki-block__title">Из Википедии</h3>
              <p class="wiki-block__text">{{ wikiData.extract }}</p>
              <a :href="wikiData.url" target="_blank" rel="noopener noreferrer" class="wiki-block__link">
                Читать полную статью на Wikipedia →
              </a>
            </div>
          </div>
          <div class="skeleton" v-else-if="wikiLoading" style="height:140px;margin-top:32px;border-radius:var(--radius)"></div>

          <!-- Tags -->
          <div class="article-tags">
            <span class="tag">{{ articleCategory?.name || article.category }}</span>
            <span class="tag" v-for="tag in (article.tags || [])" :key="tag">{{ tag }}</span>
          </div>
        </article>

        <aside class="article-page__sidebar">
          <AdBanner type="sidebar" />

          <div class="sidebar-section" v-if="sections.length > 0">
            <h3 class="sidebar-section__title">Содержание</h3>
            <button
              v-for="sec in sections"
              :key="sec"
              class="sidebar-toc__item"
              :class="{ 'sidebar-toc__item--active': activeSection === sec }"
              @click="scrollToSection(sec)"
            >{{ sec }}</button>
          </div>

          <div class="sidebar-section" v-if="relatedArticles.length > 0">
            <h3 class="sidebar-section__title">Похожие статьи</h3>
            <router-link
              v-for="rel in relatedArticles"
              :key="rel.id"
              :to="{ name: 'article', params: { slug: rel.id } }"
              class="sidebar-article"
            >
              <span class="sidebar-article__title">{{ rel.title }}</span>
              <span class="sidebar-article__meta">{{ rel.readTime }} мин</span>
            </router-link>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <div class="container" v-else>
    <div class="article-page__empty">
      <p>Статья не найдена</p>
      <router-link :to="{ name: 'catalog' }" class="btn btn-outline" style="margin-top:16px">← Все статьи</router-link>
    </div>
  </div>
</template>

<style scoped>
/* Reading progress */
.progress-bar {
  position: fixed;
  top: 64px;
  left: 0;
  height: 3px;
  background: var(--accent);
  z-index: 99;
  transition: width 0.1s ease;
}

/* Hero section */
.article-hero {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 32px;
  min-height: 360px;
}

.article-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.15) 70%, transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.article-hero__image {
  height: 360px;
  overflow: hidden;
  background: var(--hero-fallback-1);
}

.article-hero__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.article-hero__image--fallback {
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--hero-fallback-1), var(--hero-fallback-2));
}

.article-hero__placeholder {
  font-size: 5rem;
  color: rgba(255,255,255,0.15);
}

.article-hero__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px;
  color: white;
  z-index: 2;
}

.article-hero__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  opacity: 0.9;
}

.article-hero__category {
  color: white;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.8rem;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.article-hero__category:hover {
  opacity: 1;
}

.article-hero__divider {
  opacity: 0.5;
}

.article-hero__time {
  font-size: 0.8rem;
  opacity: 0.75;
}

.article-hero__title {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.article-hero__lead {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.85;
  max-width: 640px;
}

/* TOC toggle */
.toc-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  color: var(--text);
  transition: all 0.2s;
}

.toc-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.toc-toggle__arrow {
  margin-left: auto;
  transition: transform 0.2s;
  font-size: 0.7rem;
}

.toc-toggle__arrow--open {
  transform: rotate(180deg);
}

.toc {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px;
  margin-bottom: 24px;
}

.toc__item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.85rem;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 4px;
  font-family: inherit;
  transition: all 0.15s;
}

.toc__item:hover,
.toc__item--active {
  background: var(--accent-light);
  color: var(--accent);
}

/* Article body */
.article-body {
  font-size: 1.05rem;
  line-height: 1.85;
  color: var(--text);
}

/* Article sections created dynamically need global selectors */
.article-body :deep(.article-section) {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 36px 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent-light);
  scroll-margin-top: 80px;
}

.article-body :deep(.article-paragraph) {
  margin-bottom: 16px;
}

/* Callout boxes */
.article-body :deep(.article-callout) {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  margin: 24px 0;
  border-radius: var(--radius-sm);
  border-left: 4px solid;
  font-size: 0.95rem;
  line-height: 1.6;
}

.article-body :deep(.article-callout--tip) {
  background: var(--callout-tip-bg);
  border-color: var(--callout-tip-border);
}
.article-body :deep(.article-callout--info) {
  background: var(--accent-light);
  border-color: var(--accent);
}
.article-body :deep(.article-callout--warning) {
  background: var(--callout-warn-bg);
  border-color: var(--callout-warn-border);
}
.article-body :deep(.article-callout--important) {
  background: var(--callout-imp-bg);
  border-color: var(--callout-imp-border);
}

.article-body :deep(.article-callout__icon) {
  font-size: 1.2rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.article-body :deep(.article-callout__text) {
  flex: 1;
}

/* Tables */
.article-body :deep(.article-table) {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
  font-size: 0.92rem;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.article-body :deep(.article-table thead) {
  background: var(--accent);
  color: white;
}

.article-body :deep(.article-table th) {
  padding: 12px 16px;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.article-body :deep(.article-table td) {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  text-align: center;
}

.article-body :deep(.article-table tbody tr:last-child td) {
  border-bottom: none;
}

.article-body :deep(.article-table tbody tr:hover) {
  background: var(--accent-light);
}

.article-body :deep(.article-table tbody tr:nth-child(even)) {
  background: var(--bg);
}

.article-body :deep(.article-table tbody tr:nth-child(even):hover) {
  background: var(--accent-light);
}

/* Lists */
.article-body :deep(.article-list) {
  margin: 16px 0;
  padding: 0;
  list-style: none;
}

.article-body :deep(.article-list li) {
  position: relative;
  padding: 4px 0 4px 24px;
  font-size: 0.98rem;
  line-height: 1.6;
}

.article-body :deep(.article-list li::before) {
  content: '•';
  position: absolute;
  left: 6px;
  color: var(--accent);
  font-weight: 700;
}

/* Figures */
.article-body :deep(.article-figure) {
  margin: 24px 0;
  border-radius: var(--radius);
  overflow: hidden;
}

.article-body :deep(.article-figure img) {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--radius);
}

/* Image gallery */
.article-gallery {
  margin-top: 40px;
}

.article-gallery__title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.article-gallery__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.article-gallery__item {
  display: block;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg);
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-gallery__item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.article-gallery__item img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
}

.article-gallery__caption {
  display: block;
  padding: 8px 10px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Wiki block */
.wiki-block {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding: 24px;
  background: var(--accent-light);
  border-radius: var(--radius);
  border: 1px solid var(--accent-light);
}

.wiki-block__icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.wiki-block__body {
  flex: 1;
}

.wiki-block__title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--accent);
}

.wiki-block__text {
  font-size: 0.88rem;
  line-height: 1.7;
  color: var(--text-secondary);
}

.wiki-block__link {
  display: inline-block;
  margin-top: 10px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--accent);
}

.wiki-block__link:hover {
  text-decoration: underline;
}

/* Tags */
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

/* Layout */
.article-page {
  padding: 0 0 40px;
}

.article-page__layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
}

.article-page__main {
  min-width: 0;
  padding-top: 32px;
}

/* Sidebar */
.sidebar-section {
  margin-bottom: 32px;
}

.sidebar-section__title {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.sidebar-toc__item {
  display: block;
  width: 100%;
  padding: 6px 0;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  line-height: 1.4;
  transition: color 0.15s;
}

.sidebar-toc__item:hover,
.sidebar-toc__item--active {
  color: var(--accent);
}

.sidebar-article {
  display: block;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  transition: color 0.2s;
}

.sidebar-article:last-child {
  border-bottom: none;
}

.sidebar-article:hover {
  color: var(--accent);
}

.sidebar-article__title {
  display: block;
  font-size: 0.83rem;
  font-weight: 500;
  margin-bottom: 3px;
  line-height: 1.3;
}

.sidebar-article__meta {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.article-page__empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .article-page__layout {
    grid-template-columns: 1fr;
  }

  .article-page__sidebar {
    order: -1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .article-page__sidebar :deep(.ad-placeholder--sidebar) {
    min-height: 100px;
  }

  .article-gallery__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .article-hero__content {
    padding: 20px;
  }

  .article-hero__title {
    font-size: 1.5rem;
  }

  .article-hero__lead {
    font-size: 0.92rem;
  }

  .article-body {
    font-size: 0.98rem;
  }

  .article-body :deep(.article-section) {
    font-size: 1.25rem;
  }

  .article-page__sidebar {
    grid-template-columns: 1fr;
  }

  .article-gallery__grid {
    grid-template-columns: 1fr;
  }
}
</style>
