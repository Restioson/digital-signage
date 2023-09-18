import {
  choiceOfFieldset,
  setupPostForms,
  setupPreview
} from '../../config.mjs'

let pageNoCounter = 0

export function main (departmentId, existingPages) {
  const form = document.getElementById('display-group-form')

  if (form.dataset.next) {
    form.addEventListener('submit', async event => {
      event.preventDefault()

      const res = await fetch(form.action, {
        method: 'post',
        body:
          form.enctype === 'multipart/form-data'
            ? new FormData(form)
            : new URLSearchParams(new FormData(form))
      })

      if (res.status !== 200) {
        const postStatusMessage = document.getElementById('status-message')
        postStatusMessage.className = 'status-message error'
        postStatusMessage.innerText = await res.text()
      } else {
        window.location.href = form.dataset.next
      }
    })
  } else {
    setupPostForms(function (res) {
      const text = document.createElement('span')
      text.append('Successfully submitted ')

      const a = document.createElement('a')
      a.append('(view here)')
      a.href = `/display/${departmentId}/${res.id}`
      text.append(a)

      return text
    })
  }

  setupAddPage()

  if (existingPages) {
    for (const [templateId, duration, properties] of existingPages) {
      addPage(templateId, duration, properties)
    }
  }

  setupPreview(
    document.getElementById('display-group-form'),
    document.getElementById('preview')
  )
}

function addPage (templateId, duration, properties) {
  const pageNo = pageNoCounter++
  const template = document
    .getElementById('new-page-template')
    .content.cloneNode(true)
  const fieldset = template.querySelector('fieldset')

  const templateSelect = template.querySelector('.template-select')
  templateSelect.name = `template-page-${pageNo}`
  choiceOfFieldset(templateSelect, fieldset, 'template', {})

  if (templateId !== null) {
    templateSelect.value = templateId
    templateSelect.dispatchEvent(new Event('change'))
  }

  const templateDuration = template.querySelector('.template-duration')
  templateDuration.name = `duration-page-${pageNo}`

  if (duration !== null) {
    templateDuration.value = duration
  }

  for (const elt of template.querySelectorAll('[data-variable-name]')) {
    const variable = elt.dataset.variableName
    elt.name = `page-${pageNo}-template-${variable}`

    const val = properties[variable]
    if (val !== undefined) {
      if (elt.tagName === 'SELECT' && elt.multiple) {
        for (const option of elt.options) {
          option.selected = val.includes(option.value)
        }
      } else if (elt.type !== 'file') {
        elt.value = val
      }
    }
  }

  for (const elt of template.querySelectorAll('.select-file-or-url')) {
    choiceOfFieldset(elt, elt.parentElement.parentElement, 'input-for', {
      fieldsetSelector: ':scope > input'
    })
  }

  const form = document.getElementById('display-group-form')

  fieldset.querySelector('button.delete-page').addEventListener('click', () => {
    fieldset.remove()
    form.dispatchEvent(new Event('change'))
  })

  form.insertBefore(template, document.getElementById('add-page'))
  form.dispatchEvent(new Event('change'))
}

function setupAddPage () {
  document
    .getElementById('add-page')
    .addEventListener('click', () => addPage(null, null, {}))
}
