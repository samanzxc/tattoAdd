import { ref, computed } from 'vue'
import { articles, categories } from '@/data/articles.js'

const russianStemMap = {
  'тату': 'тату', 'татуировк': 'татуировка', 'татуировки': 'татуировка',
  'уход': 'уход', 'ухаживать': 'уход', 'ухажива': 'уход',
  'заживлени': 'заживление', 'заживать': 'заживление', 'зажива': 'заживление',
  'стоимост': 'стоимость', 'цен': 'цена', 'цены': 'цена',
  'материал': 'материалы', 'чернил': 'чернила', 'пигмент': 'пигменты',
  'оборудовани': 'оборудование', 'машинк': 'машинка', 'игл': 'иглы',
  'бол': 'боль', 'больн': 'больно', 'безопасн': 'безопасность',
  'иде': 'идеи', 'эскиз': 'эскизы', 'рисунк': 'рисунок',
  'истори': 'история', 'древн': 'древние', 'происхождени': 'происхождение',
  'виды': 'виды', 'стил': 'стили', 'тип': 'типы',
  'традишнл': 'traditional', 'олдскул': 'traditional', 'old school': 'traditional',
  'реализм': 'реализм', 'фотореализм': 'реализм',
  'акварел': 'акварель', 'watercolor': 'акварель',
  'минимализм': 'минимализм',
  'геометри': 'геометрия', 'мандал': 'мандала',
  'биомеханик': 'биомеханика',
  'трайбл': 'трайбл', 'tribal': 'трайбл', 'племен': 'племенные',
  'нью скул': 'new school', 'new school': 'new school',
  'рук': 'рукав', 'плеч': 'плечо', 'спин': 'спина', 'ног': 'нога', 'груд': 'грудь',
  'мест': 'место', 'размещени': 'размещение',
  'цвет': 'цвета', 'краск': 'краски',
  'салон': 'салон', 'мастер': 'мастер', 'тату салон': 'тату салон',
  'гигиен': 'гигиена', 'стерилизаци': 'стерилизация',
  'аллерги': 'аллергия', 'инфекци': 'инфекция',
  'противопоказани': 'противопоказания',
  'кож': 'кожа', 'коже': 'кожа',
  'совет': 'советы', 'рекомендаци': 'рекомендации',
  'подготовк': 'подготовка', 'перед тату': 'перед тату',
  'коррекци': 'коррекция', 'перекрыти': 'перекрытие', 'исправлени': 'исправление',
  'беременн': 'беременность',
  'лазер': 'лазер', 'удалени': 'удаление', 'свести': 'удаление'
}

function normalizeWord(word) {
  const w = word.toLowerCase().replace(/[^а-яa-z0-9]/g, '')
  return russianStemMap[w] || w
}

function tokenize(text) {
  return text.toLowerCase().split(/[\s,.\-!?;:()]+/).filter(Boolean)
}

function fuzzyMatch(word, query) {
  if (query.length < 2) return word.startsWith(query)
  if (word.includes(query)) return true

  if (word.length < 3 || query.length < 3) return word === query

  const distance = levenshtein(word.slice(0, query.length), query)
  return distance <= Math.floor(query.length / 3)
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

export function useSmartSearch() {
  const query = ref('')
  const results = ref([])
  const suggestions = ref([])
  const searched = ref(false)

  const allSearchable = computed(() => {
    const items = []
    for (const a of articles) {
      const cat = categories.find(c => c.id === a.category)
      items.push({
        type: 'article',
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        category: cat?.name || '',
        categorySlug: a.category,
        categoryColor: cat?.color || '#666',
        readTime: a.readTime,
        score: 0
      })
    }
    for (const c of categories) {
      const catArticles = articles.filter(a => a.category === c.id)
      items.push({
        type: 'category',
        id: c.slug,
        title: c.name,
        excerpt: c.description,
        content: '',
        category: '',
        categorySlug: c.slug,
        categoryColor: c.color,
        readTime: 0,
        score: 0,
        articleCount: catArticles.length
      })
    }
    return items
  })

  function getSuggestions(input) {
    if (!input || input.trim().length < 2) {
      suggestions.value = []
      return
    }
    const q = input.toLowerCase().trim()
    const seen = new Set()
    const sugg = []

    for (const item of allSearchable.value) {
      const titleWords = tokenize(item.title)
      const excerptWords = tokenize(item.excerpt)
      const allWords = [...titleWords, ...excerptWords]

      for (const w of allWords) {
        const nw = normalizeWord(w)
        if (nw && (nw.includes(normalizeWord(q)) || fuzzyMatch(nw, q))) {
          if (!seen.has(item.id)) {
            seen.add(item.id)
            sugg.push({
              id: item.id,
              excerpt: item.excerpt.slice(0, 80),
              type: item.type,
              categorySlug: item.categorySlug
            })
          }
          break
        }
      }
      if (sugg.length >= 5) break
    }

    suggestions.value = sugg
  }

  function search(input) {
    searched.value = true
    if (!input || !input.trim()) {
      results.value = []
      return
    }

    const q = input.trim()
    query.value = q
    const queryTokens = tokenize(q).map(normalizeWord)

    const scored = allSearchable.value.map(item => {
      let score = 0
      const searchText = `${item.title} ${item.excerpt} ${item.content} ${item.category}`
      const searchTokens = tokenize(searchText).map(normalizeWord)

      for (const qt of queryTokens) {
        if (!qt) continue
        for (const st of searchTokens) {
          if (st === qt) {
            score += 10
          } else if (st.includes(qt) || qt.includes(st)) {
            score += 5
          } else if (fuzzyMatch(st, qt)) {
            score += 2
          }
        }
      }

      // Boost title matches
      const titleTokens = tokenize(item.title).map(normalizeWord)
      for (const qt of queryTokens) {
        if (titleTokens.some(t => t === qt || t.includes(qt))) {
          score += 15
        }
      }

      // Boost exact phrase match
      const qLower = q.toLowerCase()
      if (item.title.toLowerCase().includes(qLower)) score += 20
      if (item.excerpt.toLowerCase().includes(qLower)) score += 8

      item.score = score
      return item
    })

    results.value = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
  }

  function highlight(text, queryStr) {
    if (!queryStr || !text) return text
    const q = queryStr.trim()
    if (!q) return text

    const words = q.split(/\s+/).filter(w => w.length > 1)
    let result = text
    for (const word of words) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escaped})`, 'gi')
      result = result.replace(regex, '<mark class="search-highlight">$1</mark>')
    }
    return result
  }

  function clear() {
    query.value = ''
    results.value = []
    suggestions.value = []
    searched.value = false
  }

  return {
    query,
    results,
    suggestions,
    searched,
    search,
    getSuggestions,
    highlight,
    clear
  }
}
