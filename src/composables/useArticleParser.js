import { computed } from 'vue'

export function useArticleParser(contentRef) {
  const parsed = computed(() => {
    const content = contentRef.value
    if (!content) return []
    const blocks = []
    const lines = content.split('\n')
    let i = 0

    while (i < lines.length) {
      const trimmed = lines[i].trim()

      if (!trimmed) {
        i++
        continue
      }

      const sectionMatch = trimmed.match(/^### (.+)/)
      if (sectionMatch) {
        blocks.push({ type: 'section', text: sectionMatch[1] })
        i++
        continue
      }

      const calloutMatch = trimmed.match(/^>\s*\[!(TIP|INFO|WARNING|IMPORTANT)\]\s*(.*)/i)
      if (calloutMatch) {
        const type = calloutMatch[1].toLowerCase()
        const calloutLines = [calloutMatch[2]]
        i++
        while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('> [')) {
          calloutLines.push(lines[i].trim())
          i++
        }
        blocks.push({ type: 'callout', calloutType: type, text: calloutLines.filter(Boolean).join(' ') })
        continue
      }

      const tableMatch = trimmed.match(/^\|(.+)\|/)
      if (tableMatch && lines[i + 1] && lines[i + 1].trim().match(/^\|[-:| ]+\|/)) {
        const headers = trimmed.split('|').filter(Boolean).map(function(s) { return s.trim() })
        const rows = []
        i += 2
        while (i < lines.length && lines[i].trim().match(/^\|(.+)\|/)) {
          const cells = lines[i].trim().split('|').filter(Boolean).map(function(s) { return s.trim() })
          rows.push(cells)
          i++
        }
        blocks.push({ type: 'table', headers: headers, rows: rows })
        continue
      }

      const listMatch = trimmed.match(/^- (.+)/)
      if (listMatch) {
        const items = [listMatch[1]]
        i++
        while (i < lines.length && lines[i].trim().match(/^- (.+)/)) {
          items.push(lines[i].trim().match(/^- (.+)/)[1])
          i++
        }
        blocks.push({ type: 'list', items })
        continue
      }

      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.+?)\)/)
      if (imgMatch) {
        blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] })
        i++
        continue
      }

      const paragraphLines = [trimmed]
      i++
      while (i < lines.length) {
        const next = lines[i].trim()
        if (!next || next.startsWith('### ') || next.startsWith('> [') || next.startsWith('- ') || next.startsWith('![') || next.startsWith('|')) break
        paragraphLines.push(next)
        i++
      }
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') })
    }

    return blocks
  })

  function renderHTML() {
    return parsed.value.map(function(block) {
      switch (block.type) {
        case 'section':
          return '<h2 class="article-section">' + block.text + '</h2>'
        case 'callout': {
          const icons = { tip: '💡', info: 'ℹ️', warning: '⚠️', important: '❗' }
          return '<div class="article-callout article-callout--' + block.calloutType + '">' +
            '<span class="article-callout__icon">' + (icons[block.calloutType] || '📌') + '</span>' +
            '<div class="article-callout__text">' + block.text + '</div>' +
          '</div>'
        }
        case 'table': {
          var thead = '<thead><tr>' + block.headers.map(function(h) { return '<th>' + h + '</th>' }).join('') + '</tr></thead>'
          var tbody = '<tbody>' + block.rows.map(function(row) {
            return '<tr>' + row.map(function(cell) { return '<td>' + cell + '</td>' }).join('') + '</tr>'
          }).join('') + '</tbody>'
          return '<table class="article-table"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>'
        }
        case 'list': {
          const items = block.items.map(function(item) { return '<li>' + item + '</li>' }).join('')
          return '<ul class="article-list">' + items + '</ul>'
        }
        case 'image':
          return '<figure class="article-figure">' +
            '<img src="' + block.src + '" alt="' + block.alt + '" loading="lazy" />' +
          '</figure>'
        case 'paragraph':
          return '<p class="article-paragraph">' + block.text + '</p>'
        default:
          return ''
      }
    }).join('\n')
  }

  const sections = computed(function() {
    return parsed.value.filter(function(b) { return b.type === 'section' }).map(function(b) { return b.text })
  })

  return { parsed: parsed, renderHTML: renderHTML, sections: sections }
}
