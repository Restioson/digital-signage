import { choiceOfFieldset, setupPostForms } from '../../config.mjs'

export function main () {
  setupPostForms()
  choiceOfFieldset('template', 'template-fieldset', 'template')
  setupPreview()
}

function setupPreview () {
  const form = document.getElementById('display-group-form')
  async function change () {
    const iframe = document.getElementById('preview')
    console.log(iframe.dataset.previewUrl)
    const res = await fetch(iframe.dataset.previewUrl, {
      method: 'post',
      body: new FormData(form)
    })

    iframe.srcdoc = await res.text()
  }

  form.addEventListener('change', change)
  change()
}
