import { deserializeFreeFormContent } from './widgets/free_form_content/free_form_content_factory.mjs'

const REFRESH_INTERVAL_MS = 1000

export function renderLecturer (lecturer) {
  const container = document.createElement('div')
  const title = document.createElement('h3')
  const body = document.createElement('p')

  title.innerText = `${lecturer.title} ${lecturer.name}`
  body.innerText = `Position: ${lecturer.position} in the ${
    lecturer.department
  } department\n
  Office Hours: ${lecturer.office_hours}\nOffice Location: ${
    lecturer.office_location
  }\n
  Email: ${lecturer.email}\nPhone: ${lecturer.phone}`
  container.append(title, body)
  return container
}

export async function refresh () {
  const contentUpdate = await fetch('/api/content').then(res => res.json())
  const lecturerUpdate = await fetch('/api/lecturers').then(res => res.json())
  const contentContainer = document.getElementById('content-container')
  const lecturerContainer = document.getElementById('lecturer-container')
  contentContainer.innerHTML = ''
  lecturerContainer.innerHTML = ''

  for (const lecturer of lecturerUpdate.lecturers) {
    lecturerContainer.appendChild(renderLecturer(lecturer))
  }
  for (const content of contentUpdate.content) {
    contentContainer.appendChild(deserializeFreeFormContent(content).render())
  }

  setTimeout(refresh, REFRESH_INTERVAL_MS)
}

export function main () {
  refresh()
}
