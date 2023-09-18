import { setupPostForms, setupPreview } from '../../config.mjs'

export function main () {
  setupPostForms()
  document.getElementById('select-group').addEventListener('change', evt => {
    evt.preventDefault()
    const select = evt.target
    if (select.value === 'create') {
      const dept = select.dataset.department
      window.location.href = `/config/departments/${dept}/display_group/add?next=${
        window.location.pathname
      }`
    }
  })

  setupPreview(
    document.getElementById('create-display-form'),
    document.getElementById('preview')
  )
}
