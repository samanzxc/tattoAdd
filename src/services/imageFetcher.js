function jsonp(url) {
  return new Promise(function(resolve, reject) {
    const callbackName = 'flickr_cb_' + Date.now() + '_' + Math.random().toString(36).slice(2)
    const script = document.createElement('script')

    window[callbackName] = function(data) {
      delete window[callbackName]
      document.head.removeChild(script)
      resolve(data)
    }

    var separator = url.includes('?') ? '&' : '?'
    script.src = url + separator + 'jsoncallback=' + callbackName
    script.onerror = function() {
      delete window[callbackName]
      if (script.parentNode) document.head.removeChild(script)
      reject(new Error('JSONP failed'))
    }

    document.head.appendChild(script)
  })
}

function upgradeFlickrUrl(src) {
  return src.replace('_m.jpg', '_z.jpg').replace('_m.', '_z.')
}

export async function fetchPinterestImages(query, limit = 8) {
  var tags = query.replace(/\s+/g, ',').replace(/,+/g, ',')
  var url = 'https://www.flickr.com/services/feeds/photos_public.gne' +
    '?tags=' + encodeURIComponent(tags) +
    '&tagmode=all&format=json&lang=en-us'

  try {
    var data = await jsonp(url)
    if (!data.items || data.items.length === 0) return []

    return data.items.slice(0, limit).map(function(item) {
      var src = item.media && item.media.m ? upgradeFlickrUrl(item.media.m) : ''
      return {
        src: src,
        alt: item.title || 'Tattoo',
        caption: item.title || '',
        link: item.link || ''
      }
    }).filter(function(p) { return p.src })
  } catch {
    return []
  }
}
