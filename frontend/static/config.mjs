export function main () {
  for (const form of document.getElementsByClassName('post-form')) {
    form.addEventListener('submit', submitPost)
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
 * Submit a 'create post' form without redirecting the page
 *
 * @param event the HTML form submit event
 * @returns {Promise<void>}
 */
async function submitPost (event) {
  event.preventDefault()
  const form = event.target

  const postStatusMessage = form.querySelector('.status-message')
  postStatusMessage.className = 'status-message' // Clear success/error class

  try {
    const res = await fetch(form.action, {
      method: 'post',
      body:
        form.enctype === 'multipart/form-data'
          ? new FormData(form)
          : new URLSearchParams(new FormData(form))
    })

    if (res.status !== 200) {
      throw new ApiError(await res.text())
    }

    postStatusMessage.classList.add('success')
    postStatusMessage.innerText = `Successfully submitted post (id: ${
      (await res.json()).id
    })`
  } catch (err) {
    postStatusMessage.classList.add('error')
    const errorBox = document.createElement('pre')
    errorBox.innerText = err instanceof ApiError ? err.response : err.message
    postStatusMessage.innerText = 'Error submitting post:'
    postStatusMessage.append(errorBox)
  }

  postStatusMessage.hidden = false
}
