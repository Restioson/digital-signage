import { main as configMain } from '../../config.mjs'

export function main () {
  configMain()

  document
    .getElementById('template')
    .addEventListener('change', function (event) {
      for (const element of document.getElementsByClassName(
        'template-fieldset'
      )) {
        element.hidden = true
        element.disabled = true
      }

      console.log('enabling', `template-${event.target.value}`)
      const enabled = document.getElementById(`template-${event.target.value}`)
      enabled.hidden = false
      enabled.disabled = false
    })

  const enabled = document.getElementById('template-1')
  enabled.hidden = false
  enabled.disabled = false
}
