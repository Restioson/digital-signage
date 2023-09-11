export function setupPostForms () {
  for (const form of document.getElementsByClassName('post-form')) {
    form.addEventListener('submit', submitPost)
  }
}

export function choiceOfFieldset (selectorId, fieldsetClass, fieldsetIdPrefix) {
  const selector = document.getElementById(selectorId)
  const form = selector.closest('form')

  selector.addEventListener('change', function (event) {
    for (const element of form.querySelectorAll(`fieldset.${fieldsetClass}`)) {
      element.hidden = true
      element.disabled = true
    }

    const enabled = document.getElementById(
      `${fieldsetIdPrefix}-${event.target.value}`
    )
    enabled.hidden = false
    enabled.disabled = false
  })

  const first = document.getElementById(`${fieldsetIdPrefix}-${selector.value}`)
  first.hidden = false
  first.disabled = false
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
    postStatusMessage.innerText = `Successfully submitted (id: ${
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
  postStatusMessage.scrollIntoView()
}
