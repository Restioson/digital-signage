export function setupPostForms () {
  for (const form of document.getElementsByClassName('post-form')) {
    form.addEventListener('submit', submitPost)
  }
}

export function choiceOfFieldset (selectorId, fieldsetClass, fieldsetIdPrefix) {
  const selector = document.getElementById(selectorId)
  const form = selector.closest('form')

  function change () {
    for (const element of form.querySelectorAll(`fieldset.${fieldsetClass}`)) {
      element.hidden = true
      element.disabled = true
    }

    const enabled = document.getElementById(
      `${fieldsetIdPrefix}-${selector.value}`
    )
    enabled.hidden = false
    enabled.disabled = false
  }

  selector.addEventListener('change', change)
  change()
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

  const postStatusMessage = document.getElementById('status-message')
  postStatusMessage.className = '' // Clear success/error class

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
    const responsemessage = await res.json()
    if (responsemessage.id === 'response needed') {
      postStatusMessage.classList.add('success')
      postStatusMessage.innerText = `Response: ${responsemessage.response}`
    } else {
      postStatusMessage.classList.add('success')
      postStatusMessage.innerText = `Successfully submitted (id: ${
        responsemessage.id
      })`
    }
  } catch (err) {
    console.log(err)
    postStatusMessage.classList.add('error')
    const errorBox = document.createElement('pre')
    errorBox.innerText = err instanceof ApiError ? err.response : err.message
    postStatusMessage.innerText = 'Error submitting post:'
    postStatusMessage.append(errorBox)
  }

  postStatusMessage.hidden = false
  window.location.replace('#status-message')

  const effect = new window.KeyframeEffect(
    postStatusMessage,
    [{ background: 'yellow' }, { background: 'transparent' }],
    { duration: 2000, direction: 'normal', easing: 'linear' }
  )
  const animation = new window.Animation(effect, document.timeline)
  animation.play()
}
