const REFRESH_INTERVAL_MS = 1000

export function renderFreeForm (content) {
  const container = document.createElement('div')
  const title = document.createElement('h3')
  const body = document.createElement('p')

  title.innerText = content.title
  body.innerText = content.body

  container.append(title, body)
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
