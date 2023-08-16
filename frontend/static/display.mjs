const REFRESH_INTERVAL_MS = 1000

export function renderFreeForm (content) {
  const container = document.createElement('div')

  if (content.type === 'text') {
    const title = document.createElement('h3')
    const body = document.createElement('p')

    title.innerText = content.title
    body.innerText = content.body

    container.append(title, body)
  } else if (content.type === 'local_image') {
    const img = document.createElement('img')
    img.src = `/api/content/${content.id}/blob`
    container.append(img)
  } else if (content.type === 'remote_image') {
    const img = document.createElement('img')
    img.src = content.src
    container.append(img)
  } else {
    const a = document.createElement('a')
    a.innerText = content.url
    a.href = content.url
    container.append(a)
  }

  if (content.caption) {
    container.append(renderCaption(content.caption))
  }

  return container
}

function renderCaption (caption) {
  const container = document.createElement('div')
  container.className = 'content-caption'

  if (caption.title) {
    const title = document.createElement('p')
    title.className = 'caption-title'
    title.innerText = caption.title
    container.append(title)
  }

  const body = document.createElement('p')
  body.className = 'caption-body'
  body.innerText = caption.body

  container.append(body)

  return container
}

export async function refresh () {
  const update = await fetch('/api/content').then(res => res.json())
  const contentContainer = document.getElementById('content-container')
  contentContainer.innerHTML = ''

  for (const content of update.content) {
    contentContainer.appendChild(renderFreeForm(content))
  }

  setTimeout(refresh, REFRESH_INTERVAL_MS)
}

export function main () {
  refresh()
}
