<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSmartSearch } from '@/composables/useSmartSearch.js'
import { useTheme } from '@/composables/useTheme.js'

const router = useRouter()
const route = useRoute()
const menuOpen = ref(false)
const searchQuery = ref('')
const showSuggestions = ref(false)
const activeSuggestion = ref(-1)

const { getSuggestions, suggestions } = useSmartSearch()
const { theme, toggle: toggleTheme } = useTheme()

function doSearch() {
  const q = searchQuery.value.trim()
  if (q) {
    router.push({ name: 'search', query: { q } })
    showSuggestions.value = false
    searchQuery.value = ''
  }
}

function onInput(e) {
  const val = e.target.value
  searchQuery.value = val
  if (val.trim().length >= 2) {
    getSuggestions(val)
    showSuggestions.value = true
    activeSuggestion.value = -1
  } else {
    showSuggestions.value = false
    getSuggestions('')
  }
}

function selectSuggestion(sug) {
  showSuggestions.value = false
  searchQuery.value = ''
  if (sug.type === 'category') {
    router.push({ name: 'category', params: { slug: sug.categorySlug } })
  } else {
    router.push({ name: 'article', params: { slug: sug.id } })
  }
}

function onKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeSuggestion.value = Math.min(activeSuggestion.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeSuggestion.value = Math.max(activeSuggestion.value - 1, -1)
  } else if (e.key === 'Enter' && activeSuggestion.value >= 0) {
    e.preventDefault()
    selectSuggestion(suggestions.value[activeSuggestion.value])
  }
}

watch(() => route.fullPath, () => {
  showSuggestions.value = false
  menuOpen.value = false
})

const navItems = [
  { label: 'Главная', route: 'home' },
  { label: 'Статьи', route: 'catalog' },
  { label: 'О сайте', route: 'about' }
]
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <router-link :to="{ name: 'home' }" class="header__logo">
        <span class="header__logo-icon">✦</span>
        <span>TattooInfo</span>
      </router-link>

      <nav class="header__nav" :class="{ 'header__nav--open': menuOpen }">
        <router-link
          v-for="item in navItems"
          :key="item.route"
          :to="{ name: item.route }"
          class="header__link"
          :class="{ 'header__link--active': $route.name === item.route }"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <div class="header__search-wrap">
        <form class="header__search" @submit.prevent="doSearch">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск..."
            class="header__search-input"
            aria-label="Поиск по сайту"
            @input="onInput"
            @focus="searchQuery.trim().length >= 2 ? showSuggestions = true : null"
            @keydown="onKeydown"
            @blur="setTimeout(() => showSuggestions = false, 200)"
          />
          <button type="submit" class="header__search-btn" aria-label="Найти">⌕</button>
        </form>
        <div class="header__suggestions" v-if="showSuggestions && suggestions.length > 0">
          <button
            v-for="(sug, i) in suggestions"
            :key="sug.id"
            class="header__suggestion"
            :class="{ 'header__suggestion--active': activeSuggestion === i }"
            @mousedown.prevent="selectSuggestion(sug)"
          >

            <div class="header__suggestion-text">
              <span class="header__suggestion-title">{{ sug.label }}</span>
              <span class="header__suggestion-desc">{{ sug.excerpt }}</span>
            </div>
          </button>
          <div class="header__suggestion-seeall" @mousedown.prevent="doSearch">
            Все результаты →
          </div>
        </div>
      </div>

      <button
        class="header__theme"
        @click="toggleTheme"
        :title="theme === 'light' ? 'Тёмная тема' : 'Светлая тема'"
        :aria-label="theme === 'light' ? 'Тёмная тема' : 'Светлая тема'"
      >
        <span class="header__theme-icon" :class="{ 'header__theme-icon--dark': theme === 'dark' }">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" class="header__theme-sun" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" class="header__theme-rays" />
            <path d="M12 3a9 9 0 1 0 9 9" class="header__theme-moon" />
          </svg>
        </span>
      </button>

      <button
        class="header__burger"
        :class="{ 'header__burger--active': menuOpen }"
        @click="menuOpen = !menuOpen"
        aria-label="Меню"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: var(--header-bg);
}

.header__inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 24px;
}

.header__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  flex-shrink: 0;
}

.header__logo-icon {
  color: var(--accent);
  font-size: 1.4rem;
}

.header__nav {
  display: flex;
  gap: 4px;
  flex: 1;
}

.header__link {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.header__link:hover {
  color: var(--text);
  background: var(--accent-light);
}

.header__link--active {
  color: var(--accent);
  background: var(--accent-light);
}

.header__search-wrap {
  position: relative;
  flex-shrink: 0;
}

.header__search {
  display: flex;
  align-items: center;
  position: relative;
}

.header__search-input {
  width: 200px;
  padding: 8px 36px 8px 14px;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  font-size: 0.85rem;
  font-family: inherit;
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: all 0.2s;
}

.header__search-input:focus {
  border-color: var(--accent);
  background: var(--bg-card);
  width: 260px;
}

.header__search-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  line-height: 1;
}

.header__suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-hover);
  overflow: hidden;
  z-index: 200;
}

.header__suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.header__suggestion:hover,
.header__suggestion--active {
  background: var(--accent-light);
}

.header__suggestion-type {
  font-size: 1rem;
  flex-shrink: 0;
}

.header__suggestion-text {
  min-width: 0;
}

.header__suggestion-title {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
}

.header__suggestion-desc {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header__suggestion-seeall {
  padding: 8px 14px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--accent);
  border-top: 1px solid var(--border);
  cursor: pointer;
  text-align: center;
}

.header__suggestion-seeall:hover {
  background: var(--accent-light);
}

.header__theme {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1.5px solid var(--border);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;
}

.header__theme:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
  transform: rotate(30deg);
}

.header__theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: transform 0.5s ease;
}

.header__theme-icon--dark {
  transform: rotate(360deg);
}

.header__theme-icon svg {
  width: 20px;
  height: 20px;
}

.header__theme-sun,
.header__theme-rays {
  opacity: 1;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.header__theme-moon {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.header__theme-icon--dark .header__theme-sun,
.header__theme-icon--dark .header__theme-rays {
  opacity: 0;
  transform: scale(0.5);
}

.header__theme-icon--dark .header__theme-moon {
  opacity: 1;
}

.header__burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.header__burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: 0.3s;
}

.header__burger--active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.header__burger--active span:nth-child(2) { opacity: 0; }
.header__burger--active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

@media (max-width: 768px) {
  .header__nav {
    display: none;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--bg-card);
    flex-direction: column;
    padding: 16px;
    border-bottom: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .header__nav--open {
    display: flex;
  }

  .header__search-input {
    width: 140px;
  }

  .header__search-input:focus {
    width: 180px;
  }

  .header__burger {
    display: flex;
    margin-left: 12px;
  }
}
</style>
