import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryBySlug, getArticleBySlug } from '@/data/articles.js'

const BASE_URL = 'https://samanzxc.github.io/tattoLove'
const DEFAULT_DESC = 'Полный гид по миру тату-искусства: стили, уход, материалы, история и вдохновение.'
const DEFAULT_KEYWORDS = 'тату, татуировки, виды татуировок, стили тату, уход за тату, стоимость тату, чернила для тату, история тату, идеи тату, тату салон, тату мастер'

const pageMeta = {
  home: {
    title: 'TattooInfo — Всё о татуировках | Стили, уход, стоимость, материалы',
    desc: DEFAULT_DESC,
    keywords: DEFAULT_KEYWORDS
  },
  catalog: {
    title: 'Все статьи о татуировках | TattooInfo',
    desc: 'Полный каталог статей о татуировках: виды и стили, уход, стоимость, материалы, история, идеи для эскизов.',
    keywords: 'статьи о тату, каталог тату, виды тату, стили татуировок'
  },
  category: {
    dynamic: true,
    get(slug) {
      const cat = getCategoryBySlug(slug)
      if (!cat) return null
      const keywordsMap = {
        types: 'виды татуировок, стили тату, traditional, реализм, акварель, минимализм, биомеханика, трайбл, геометрия, new school',
        care: 'уход за тату, заживление тату, уход после татуировки, мазь для тату, как ухаживать за тату',
        cost: 'стоимость тату, цена татуировки, сколько стоит тату, цены на тату, бюджет тату',
        materials: 'чернила для тату, материалы для тату, оборудование, тату машинка, иглы для тату, пигменты',
        pain: 'боль от тату, безопасность тату, гигиена тату салона, стерилизация, противопоказания тату',
        ideas: 'идеи для тату, эскизы тату, что набить, популярные татуировки, место для тату',
        history: 'история татуировки, древние тату, происхождение тату, эци, полинезия, японские тату',
        aftercare: 'заживление тату, этапы заживления, что нельзя после тату, восстановление кожи'
      }
      return {
        title: `${cat.name} | TattooInfo`,
        desc: `${cat.description}. ${cat.name}: подробные статьи, советы и рекомендации.`,
        keywords: keywordsMap[slug] || cat.name.toLowerCase()
      }
    }
  },
  article: {
    dynamic: true,
    get(slug) {
      const article = getArticleBySlug(slug)
      if (!article) return null
      return {
        title: `${article.title} | TattooInfo`,
        desc: article.excerpt,
        keywords: `${article.title.toLowerCase()}, ${article.category}, татуировка, тату, информация о тату`
      }
    }
  },
  search: {
    title: 'Поиск — TattooInfo',
    desc: 'Поиск по сайту TattooInfo. Найдите нужную информацию о татуировках.',
    keywords: 'поиск тату, найти тату, информация тату'
  },
  about: {
    title: 'О сайте | TattooInfo',
    desc: 'TattooInfo — информационный проект о татуировках. Все о стилях, уходе, материалах и истории тату-культуры.',
    keywords: 'о проекте, информация, тату сайт, контакты'
  }
}

export function useSeo() {
  const route = useRoute()

  watch(() => route.fullPath, () => {
    const name = route.name
    const meta = pageMeta[name]

    let title, desc, keywords

    if (meta?.dynamic) {
      const dynamic = meta.get(route.params.slug)
      if (dynamic) {
        title = dynamic.title
        desc = dynamic.desc
        keywords = dynamic.keywords
      }
    } else if (meta) {
      title = meta.title
      desc = meta.desc
      keywords = meta.keywords
    }

    // If article or search with query, customize
    if (name === 'search' && route.query.q) {
      title = `Результаты поиска: "${route.query.q}" | TattooInfo`
      desc = `Результаты поиска по запросу "${route.query.q}" на TattooInfo. Статьи о татуировках.`
    }

    if (title) {
      document.title = title
      updateMeta('og:title', title)
    }
    if (desc) {
      updateMeta('description', desc)
      updateMeta('og:description', desc)
    }
    if (keywords) {
      updateMeta('keywords', keywords)
    }

    updateMeta('og:url', `${BASE_URL}/#${route.fullPath}`)
    updateMeta('og:type', name === 'article' ? 'article' : 'website')
  }, { immediate: true })
}

function updateMeta(name, content) {
  const prop = name === 'description' || name === 'keywords' ? 'name' : 'property'
  let el = document.querySelector(`meta[${prop}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(prop, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
