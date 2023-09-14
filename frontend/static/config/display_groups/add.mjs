import { choiceOfFieldset, setupPostForms } from '../../config.mjs'

export function main () {
  setupPostForms()
  choiceOfFieldset('template', 'template-fieldset', 'template')
  setupPreview()
  setupPagesProperties()
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

function setupPagesProperties () {
  for (const addButton of document.getElementsByClassName('add-page')) {
    addButton.addEventListener('click', function () {
      const textarea = document.createElement('textarea')
      textarea.rows = 10
      textarea.name = `template-${addButton.dataset.variableName}[]`
      textarea.value = '<p>Hello there!</p>'

      const label = document.createElement('label')
      label.innerText = 'Custom page'
      label.append(textarea)

      const container = document.createElement('div')
      container.className = 'custom-page-container'
      container.append(label)

      const deleteButton = document.createElement('button')
      deleteButton.innerText = 'Delete'
      deleteButton.addEventListener('click', function () {
        container.remove()
      })
      container.append(deleteButton)

      const fieldset = addButton.parentElement
      fieldset.append(container)
    })
  }
}
