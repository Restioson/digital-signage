export function main () {
  for (const button of document.getElementsByClassName('delete-button')) {
    button.addEventListener('click', deleteFileById)
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
 * Delete a file. This can't be a form since HTML doesn't allow
 * `DELETE` as the method of a form.
 *
 * @param event the HTML button click event
 * @returns {Promise<void>}
 */
async function deleteFileById (event) {
  event.preventDefault()
  const button = event.target
  const statusMessage = document.getElementById('status-message')
  statusMessage.className = '' // Clear success/error class
  const row = button.parentElement.parentElement
  const fileName = button.dataset.filename
  const deptId = button.dataset.department_id

  try {
    const res = await fetch(`/api/departments/${deptId}/files/${fileName}`, {
      method: 'delete'
    })

    if (res.status !== 200) {
      throw new ApiError(await res.text())
    }

    row.remove()

    statusMessage.classList.add('success')
    statusMessage.innerText = `Successfully deleted file (name: ${fileName})`
  } catch (err) {
    statusMessage.classList.add('error')
    const errorBox = document.createElement('pre')
    errorBox.innerText = err instanceof ApiError ? err.response : err.message
    statusMessage.innerText = 'Error deleting person:'
    statusMessage.append(errorBox)
  }

  statusMessage.hidden = false
  window.location.replace('#status-message')

  const effect = new window.KeyframeEffect(
    statusMessage,
    [{ background: 'yellow' }, { background: 'transparent' }],
    { duration: 2000, direction: 'normal', easing: 'linear' }
  )
  const animation = new window.Animation(effect, document.timeline)
  animation.play()
}
