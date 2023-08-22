import { ContentStream } from './widgets/free_form_content/content_stream.mjs'
import { Department } from './widgets/department.mjs'
import { Container } from './widgets/container.js'

const REFRESH_INTERVAL_MS = 1000

const mainWidget = new Container({
  children: [new Department(), new ContentStream()]
})

export async function refresh () {
  const root = document.getElementById('root')

  await mainWidget.refresh()
  root.replaceChildren(mainWidget.render())

  setTimeout(refresh, REFRESH_INTERVAL_MS)
}

export function main () {
  refresh()
}
