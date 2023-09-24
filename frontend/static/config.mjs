import { Root } from './widgets/root.mjs'
import { ContentStream } from './widgets/free_form_content/content_stream.mjs'

export function setupPostForms (createSuccessText) {
  for (const form of document.getElementsByClassName('post-form')) {
    form.addEventListener('submit', event =>
      submitPost(event, form, createSuccessText)
    )

    form
      .querySelector('button[type="submit"]')
      .addEventListener('click', function (evt) {
        evt.preventDefault()
        submitPost(null, form, createSuccessText)
      })
  }
}

async function deleteDepartment (event) {
  event.preventDefault()
  const button = event.target.closest('button')

  const statusMessage = document.getElementById('status-message')
  statusMessage.className = '' // Clear success/error class

  const row = button.parentElement.parentElement
  const departmentName = row.children[0].innerText
  const departmentid = button.dataset.department_id
  console.log(button)

  try {
    const res = await fetch(`/api/departments/${departmentid}`, {
      method: 'delete'
    })

    if (res.status !== 200) {
      throw new ApiError(await res.text())
    }

    row.remove()

    statusMessage.classList.add('success')
    statusMessage.innerText = `Successfully deleted department (name: ${departmentName})`
  } catch (err) {
    statusMessage.classList.add('error')
    const errorBox = document.createElement('pre')
    errorBox.innerText = err instanceof ApiError ? err.response : err.message
    statusMessage.innerText = 'Error deleting user:'
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

// Do not require shift/ctrl click to select multiple
export function setupSelectMultiple (select) {
  for (const option of select.querySelectorAll('option')) {
    console.log(option)
    option.addEventListener('mousedown', evt => {
      const scroll = option.parentElement.scrollTop

      evt.preventDefault()
      option.selected = !option.selected
      select.focus()

      setTimeout(function () {
        option.parentElement.scrollTop = scroll
      }, 0)

      select.closest('form').dispatchEvent(new Event('change'))

      return false
    })
  }

  select.addEventListener('click', evt => {
    evt.preventDefault()
  })
}

async function deleteUser (event) {
  event.preventDefault()
  const button = event.target.closest('button')

  const statusMessage = document.getElementById('status-message')
  statusMessage.className = '' // Clear success/error class

  const row = button.parentElement.parentElement
  const username = row.children[0].innerText
  const userEmail = button.dataset.userEmail
  console.log(button)

  try {
    const res = await fetch(`/api/user/${userEmail}`, {
      method: 'delete'
    })

    if (res.status !== 200) {
      throw new ApiError(await res.text())
    }

    row.remove()

    statusMessage.classList.add('success')
    statusMessage.innerText = `Successfully deleted user (name: ${username})`
  } catch (err) {
    statusMessage.classList.add('error')
    const errorBox = document.createElement('pre')
    errorBox.innerText = err instanceof ApiError ? err.response : err.message
    statusMessage.innerText = 'Error deleting user:'
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

export function populateDepartments (departmentDataJson) {
  const departmentSelect = document.getElementById('department')
  const departmentData = JSON.parse(departmentDataJson)
  if (departmentData && Array.isArray(departmentData.departments)) {
    departmentData.departments.forEach(department => {
      const option = document.createElement('option')
      option.value = department.id
      option.text = department.name
      departmentSelect.appendChild(option)
    })
  } else {
    console.error('Invalid data format:', departmentData)
  }
}

export function populateUsersAndDepartments (userDataJson, departmentDataJson) {
  const userListTable = document
    .getElementById('user-list')
    .querySelector('tbody')
  const departmentTable = document
    .getElementById('department-list')
    .querySelector('tbody')

  const userData = JSON.parse(userDataJson)
  const departmentData = JSON.parse(departmentDataJson)

  if (
    userData &&
    Array.isArray(userData.departments) &&
    departmentData &&
    Array.isArray(departmentData.departments)
  ) {
    const departmentMap = new Map(
      departmentData.departments.map(dep => [dep.id, dep.name])
    )

    userData.departments.forEach(user => {
      if (user.email !== 'A@ADMIN') {
        const row = document.createElement('tr')
        row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.username}</td>
        <td>${departmentMap.get(user.department)}</td>
        <td>${user.permissions}</td>
        <td>
        <button type="button" class="delete-user icon-button" 
        data-user-email="${user.email}">
        <span class="material-symbols-outlined button-icon">delete</span>
        </button>
        </td>
      `
        userListTable.appendChild(row)
      } else {
        const row = document.createElement('tr')
        row.innerHTML = `
        <td>${user.email}</td>
        <td>${user.username}</td>
        <td>${departmentMap.get(user.department)}</td>
        <td>${user.permissions}</td>
        <td></td>`
        userListTable.appendChild(row)
      }
    })

    departmentData.departments.forEach(department => {
      if (department.id !== 1) {
        const row = document.createElement('tr')
        row.innerHTML = `
        <td>${department.name}
        <button type="button" class="delete-department icon-button" 
        data-department_id="${department.id}">
        <span class="material-symbols-outlined button-icon">delete</span>
        </button>
        </td>
      `
        departmentTable.appendChild(row)
      } else {
        const row = document.createElement('tr')
        row.innerHTML = `
        <td>${department.name}
        </td> <td></td>`
        departmentTable.appendChild(row)
      }
    })

    for (const button of document.getElementsByClassName(
      'delete-user icon-button'
    )) {
      button.addEventListener('click', deleteUser)
    }
    for (const button of document.getElementsByClassName(
      'delete-department icon-button'
    )) {
      button.addEventListener('click', deleteDepartment)
    }
  } else {
    console.error('Invalid data format:', userData, departmentData)
  }
}

export function showContent (streams) {
  Root.create({
    child: new ContentStream({ streams, editable: true }),
    targetElement: document.getElementById('root'),
    departmentId: 0,
    displayContentStream: 0
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

export class ApiError extends Error {
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

    if (form.dataset.redirectTo) {
      window.location.replace(form.dataset.redirectTo)
      return
    }
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
