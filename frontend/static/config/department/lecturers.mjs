export function main () {
  for (const button of document.getElementsByClassName('delete-button')) {
    button.addEventListener('click', deleteLecturer)
  }
}

class ApiError extends Error {
  constructor (response) {
    super(`Response from API: ${response}`)
    this.name = 'ApiError'
    this.response = response
  }
}

/**
 * Delete a lecturer. This can't be a form since HTML doesn't allow
 * `DELETE` as the method of a form.
 *
 * @param event the HTML button click event
 * @returns {Promise<void>}
 */
async function deleteLecturer (event) {
  event.preventDefault()
  const button = event.target

  const statusMessage = document.querySelector('.status-message')
  statusMessage.className = 'status-message' // Clear success/error class

  const row = button.parentElement.parentElement
  const lecturerName = row.children[0].innerText
  const id = button.dataset.lecturerId

  try {
    const res = await fetch(`/api/lecturers/${id}`, { method: 'delete' })

    if (res.status !== 200) {
      throw new ApiError(await res.text())
    }

    row.remove()

    statusMessage.classList.add('success')
    statusMessage.innerText = `Successfully deleted lecturer (name: ${lecturerName})`
  } catch (err) {
    statusMessage.classList.add('error')
    const errorBox = document.createElement('pre')
    errorBox.innerText = err instanceof ApiError ? err.response : err.message
    statusMessage.innerText = 'Error deleting lecturer:'
    statusMessage.append(errorBox)
  }

  statusMessage.hidden = false
  statusMessage.scrollIntoView()
}
