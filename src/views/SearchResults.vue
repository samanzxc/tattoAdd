<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSmartSearch } from '@/composables/useSmartSearch.js'
import { searchWikipedia } from '@/services/api.js'
import AdBanner from '@/components/AdBanner.vue'

const route = useRoute()
const router = useRouter()
const { query, results, search, highlight, getSuggestions, suggestions } = useSmartSearch()
const wikiResults = ref([])
const loading = ref(false)
const localQuery = ref('')

const suggestionsForInput = computed(() => {
  const q = localQuery.value.trim()
  if (q.length >= 2 && q !== route.query.q) {
    return suggestions.value
  }
  return []
})

function doSearch(q) {
  if (!q || !q.trim()) return
  loading.value = true
  localQuery.value = q
  search(q)
  searchWikipedia(q).then(res => {
    wikiResults.value = res || []
    loading.value = false
  })
}

onMounted(() => {
  const q = route.query.q
  if (q) {
    localQuery.value = q
    doSearch(q)
  }
})

watch(() => route.query.q, (q) => {
  if (q && q !== query.value) {
    localQuery.value = q
    doSearch(q)
  }
})

function onSubmit() {
  const q = localQuery.value.trim()
  if (q) {
    router.push({ name: 'search', query: { q } })
  }
}

function asQuery(q) {
  router.push({ name: 'search', query: { q } })
}
</script>

<template>
  <div class="search">
    <div class="container">
      <div class="search__header">
        <form @submit.prevent="onSubmit" class="search__form">
          <input
            v-model="localQuery"
            type="text"
            placeholder="Что вас интересует?"
            class="search__input"
            @input="localQuery.trim().length >= 2 ? getSuggestions(localQuery) : null"
          />
          <button type="submit" class="search__submit">Найти</button>
        </form>
        <div class="search__inline-suggestions" v-if="suggestionsForInput.length > 0 && !loading">
          <button
            v-for="sug in suggestionsForInput"
            :key="sug.id"
            class="search__inline-sug"
            @click="asQuery(sug.label)"
          >{{ sug.label }}</button>
        </div>
        <h1 class="search__title" v-if="query">Результаты: "{{ query }}"</h1>
        <p class="search__stats" v-if="results.length > 0">Найдено {{ results.length }} статей</p>
      </div>

      <AdBanner type="banner" />

      <div v-if="loading" class="search__loading">
        <div class="skeleton" style="height:200px;width:100%"></div>
        <div class="skeleton" style="height:200px;width:100%;margin-top:16px"></div>
      </div>

      <!-- Local Results -->
      <div v-else-if="results.length > 0" class="search__results">
        <h2 class="search__section-title">На сайте</h2>
        <div class="search__list">
          <router-link
            v-for="item in results"
            :key="item.id"
            :to="{ name: item.type === 'category' ? 'category' : 'article', params: { slug: item.id } }"
            class="card search-item"
          >
            <div class="search-item__meta">
              <span class="tag" v-if="item.category" :style="{ background: item.categoryColor + '18', color: item.categoryColor }">
                {{ item.category }}
              </span>
              <span class="search-item__type">{{ item.type === 'category' ? 'Категория' : 'Статья' }}</span>
              <span class="search-item__read" v-if="item.readTime">{{ item.readTime }} мин</span>
            </div>
            <h3 class="search-item__title" v-html="highlight(item.title, query)"></h3>
            <p class="search-item__excerpt" v-html="highlight(item.excerpt, query)"></p>
            <span class="search-item__arrow">→</span>
          </router-link>
        </div>
      </div>

      <div v-else-if="query && !loading" class="search__empty">
        <p>По запросу "{{ query }}" ничего не найдено</p>
        <p class="search__hint">Попробуйте: <button class="search__hint-link" @click="asQuery('уход за тату')">уход за тату</button>, <button class="search__hint-link" @click="asQuery('виды татуировок')">виды татуировок</button>, <button class="search__hint-link" @click="asQuery('стоимость тату')">стоимость тату</button></p>
      </div>

      <!-- Wikipedia Results -->
      <div v-if="wikiResults.length > 0 && !loading" class="search__wiki">
        <h2 class="search__section-title">Из Wikipedia</h2>
        <div class="wiki-results">
          <a
            v-for="item in wikiResults"
            :key="item.pageid"
            :href="`https://en.wikipedia.org/?curid=${item.pageid}`"
            target="_blank"
            rel="noopener noreferrer"
            class="card wiki-item"
          >
            <h3 class="wiki-item__title" v-html="highlight(item.title, query)"></h3>
            <p class="wiki-item__snippet" v-html="highlight(item.snippet, query)"></p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search {
  padding: 40px 0;
  min-height: 60vh;
}

.search__header {
  margin-bottom: 32px;
}

.search__form {
  display: flex;
  gap: 8px;
  max-width: 600px;
  margin-bottom: 24px;
}

.search__input {
  flex: 1;
  padding: 14px 20px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg-card);
  outline: none;
  transition: border-color 0.2s;
}

.search__input:focus {
  border-color: var(--accent);
}

.search__submit {
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

.search__submit:hover {
  background: var(--accent-hover);
}

.search__inline-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.search__inline-sug {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg-card);
  font-size: 0.82rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.search__inline-sug:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}

.search__title {
  font-size: 1.5rem;
  font-weight: 700;
}

.search__stats {
  margin-top: 8px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.search__section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.search__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-item {
  padding: 20px;
  display: block;
  position: relative;
}

.search-item__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.search-item__type {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.search-item__read {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.search-item__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
}

.search-item__excerpt {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.search-item__arrow {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: var(--border);
  transition: color 0.2s, transform 0.2s;
}

.search-item:hover .search-item__arrow {
  color: var(--accent);
  transform: translateY(-50%) translateX(4px);
}

.search__empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-secondary);
}

.search__hint {
  margin-top: 12px;
  font-size: 0.85rem;
  line-height: 2;
}

.search__hint-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  text-decoration: underline;
  padding: 4px 8px;
}

.search__loading {
  padding: 20px 0;
}

.wiki-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wiki-item {
  padding: 20px;
}

.wiki-item__title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.wiki-item__snippet {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

:deep(.search-highlight) {
  background: var(--highlight-bg);
  color: var(--highlight-text);
  padding: 0 2px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .search__form {
    flex-direction: column;
  }

  .search__title {
    font-size: 1.2rem;
  }
}
</style>
