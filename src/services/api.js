import axios from 'axios'

const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const WIKI_MEDIA = 'https://en.wikipedia.org/api/rest_v1/page/media-list/'

export async function fetchWikipediaSummary(title) {
  try {
    const { data } = await axios.get(`${WIKI_API}${encodeURIComponent(title)}`, {
      params: { redirect: true }
    })
    return {
      title: data.title,
      extract: data.extract,
      thumbnail: data.thumbnail?.source || null,
      url: data.content_urls?.desktop?.page || null
    }
  } catch {
    return null
  }
}

export async function fetchWikipediaImages(title) {
  try {
    const { data } = await axios.get(`${WIKI_MEDIA}${encodeURIComponent(title)}`, {
      params: { redirect: true }
    })
    if (data?.items) {
      return data.items
        .filter(item => item.type === 'image' && item.srcset && item.srcset.length > 0)
        .slice(0, 6)
        .map(item => ({
          src: item.srcset[0]?.src || item.src,
          alt: item.title || 'Фото',
          caption: (item.caption || '').replace(/<[^>]*>/g, '')
        }))
    }
    return []
  } catch {
    return []
  }
}

export async function fetchWikiImagesBySearch(query) {
  try {
    const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        srlimit: 3,
        origin: '*'
      }
    })
    if (data?.query?.search?.length > 0) {
      const pageTitle = data.query.search[0].title
      return fetchWikipediaImages(pageTitle)
    }
    return []
  } catch {
    return []
  }
}

export async function searchWikipedia(query) {
  try {
    const { data } = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        srlimit: 10,
        origin: '*'
      }
    })
    return data.query.search.map(item => ({
      title: item.title,
      snippet: item.snippet.replace(/<[^>]*>/g, ''),
      pageid: item.pageid
    }))
  } catch {
    return []
  }
}

export async function fetchFromTattooAPI(endpoint) {
  try {
    const { data } = await axios.get(`https://tattoo-api.com/api/v1/${endpoint}`, {
      timeout: 5000
    })
    return data
  } catch {
    return null
  }
}
