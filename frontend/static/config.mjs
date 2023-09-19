export function setupPostForms (createSuccessText) {
  for (const form of document.getElementsByClassName('post-form')) {
    form.addEventListener('submit', event =>
      submitPost(event, form, createSuccessText)
    )

    form
      .querySelector('button[type="submit"]')
      .addEventListener('click', function () {
        submitPost(null, form, createSuccessText)
      })
  }
}

export function setupBackButton () {
  document.getElementById('backButton').addEventListener('click', function () {
    window.history.back()
  })
}

export function choiceOfFieldset (
  selector,
  fieldsetsContainer,
  fieldsetClassPrefix,
  { fieldsetSelector = ':scope > fieldset' }
) {
  function change () {
    for (const element of fieldsetsContainer.querySelectorAll(
      fieldsetSelector
    )) {
      element.hidden = true
      element.disabled = true
    }

    const enabled = fieldsetsContainer.querySelector(
      `.${fieldsetClassPrefix}-${selector.value
        .replace(/\./g, '-')
        .replace(/\//g, '-')}`
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
async function submitPost (event, form, createText) {
  if (event) {
    event.preventDefault()
  }

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
    const responseMessage = await res.json()

    const createSuccessText =
      createText || (res => `Successfully submitted (id: ${res.id})`)
    postStatusMessage.classList.add('success')
    postStatusMessage.innerHTML = ''
    postStatusMessage.append(createSuccessText(responseMessage))
  } catch (err) {
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
