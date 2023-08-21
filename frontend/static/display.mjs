import { deserializeFreeFormContent } from './widgets/free_form_content/free_form_content_factory.mjs'
import { Lecturer } from './widgets/lecturer.js'

const REFRESH_INTERVAL_MS = 1000

export async function refresh () {
  const contentUpdate = await fetch('/api/content').then(res => res.json())
  const lecturerUpdate = await fetch('/api/lecturers').then(res => res.json())
  const contentContainer = document.getElementById('content-container')
  const lecturerContainer = document.getElementById('lecturer-container')
  contentContainer.innerHTML = ''
  lecturerContainer.innerHTML = ''

  for (const lecturer of lecturerUpdate.lecturers) {
    lecturerContainer.appendChild(Lecturer.fromJSON(lecturer).render())
  }
  for (const content of contentUpdate.content) {
    contentContainer.appendChild(deserializeFreeFormContent(content).render())
  }

  setTimeout(refresh, REFRESH_INTERVAL_MS)
}

export function main () {
  refresh()
}
