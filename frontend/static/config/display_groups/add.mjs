import { choiceOfFieldset, setupPostForms } from '../../config.mjs'

let pageNoCounter = 0

export function main (departmentId) {
  setupPostForms(function (res) {
    const text = document.createElement('span')
    text.append('Successfully submitted ')

    const a = document.createElement('a')
    a.append('(view here)')
    a.href = `/display/${departmentId}/${res.id}`
    text.append(a)

    return text
  })
  setupPreview()
  setupAddPage()
}

function setupAddPage () {
  document.getElementById('add-page').addEventListener('click', function () {
    const pageNo = pageNoCounter++
    const template = document
      .getElementById('new-page-template')
      .content.cloneNode(true)
    const fieldset = template.querySelector('fieldset')

    const templateSelect = template.querySelector('.template-select')
    templateSelect.name = `template-page-${pageNo}`
    choiceOfFieldset(templateSelect, fieldset, 'template', {})

    for (const elt of template.querySelectorAll('[data-variable-name]')) {
      elt.name = `page-${pageNo}-template-${elt.dataset.variableName}`
    }

    for (const elt of template.querySelectorAll('.select-file-or-url')) {
      choiceOfFieldset(elt, elt.parentElement.parentElement, 'input-for', {
        fieldsetSelector: ':scope > input'
      })
    }

    const form = document.getElementById('display-group-form')

    fieldset
      .querySelector('button.delete-page')
      .addEventListener('click', () => {
        fieldset.remove()
        form.dispatchEvent(new Event('change'))
      })

    form.insertBefore(template, document.getElementById('add-page'))
    form.dispatchEvent(new Event('change'))
  })
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
