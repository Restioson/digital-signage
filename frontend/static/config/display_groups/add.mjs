import { choiceOfFieldset, setupPostForms } from '../../config.mjs'

let pageNoCounter = 0

export function main (departmentId, existingPages) {
  setupPostForms(function (res) {
    const text = document.createElement('span')
    text.append('Successfully submitted ')

    const a = document.createElement('a')
    a.append('(view here)')
    a.href = `/display/${departmentId}/${res.id}`
    text.append(a)

    return text
  })
  setupAddPage()

  if (existingPages) {
    for (const [templateId, duration, properties] of existingPages) {
      addPage(templateId, duration, properties)
    }
  }

  setupPreview()
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

function setupPreview () {
  const form = document.getElementById('display-group-form')
  async function change () {
    const iframe = document.getElementById('preview')
    const res = await fetch(iframe.dataset.previewUrl, {
      method: 'post',
      body: new FormData(form)
    })

    iframe.srcdoc = await res.text()
  }

  form.addEventListener('change', change)
  change()
}
