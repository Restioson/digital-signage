import {
  choiceOfFieldset,
  setupPostForms,
  setupSelectMultiple
} from '../../config.mjs'

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
  addTab('Overview', document.getElementById('overview-tab'), false)

  if (existingPages && existingPages.length !== 0) {
    for (const [templateId, duration, properties] of existingPages) {
      addPage(templateId, duration, properties)
    }
    document.querySelector('#no-pages').hidden = true
  } else {
    document.querySelector('button[type=submit]').disabled = true
  }

  setupPreview(null, document.getElementById('preview-all'))
}

function setupFormElement (elt, pageNo, properties) {
  let variable = elt.dataset.variableName
  elt.name = `page-${pageNo}-template-${variable}`

  if (variable.endsWith('[]')) {
    variable = variable.substring(0, variable.length - 2)
  }

  const val = properties[variable]
  if (val !== undefined) {
    if (elt.tagName === 'SELECT' && elt.multiple) {
      for (const option of elt.options) {
        option.selected = val.includes(option.value)
      }
      setupSelectMultiple(elt, false)
    } else if (elt.tagName === 'INPUT' && elt.type !== 'file') {
      elt.value = val
    }
  }
}

function addTab (title, element, withDelete) {
  const list = document.getElementById('tab-list')
  const tabHeader = document.createElement('div')

  tabHeader.className = 'tab-select'
  tabHeader.append(title)

  if (withDelete) {
    const deleteButton = document.createElement('span')
    deleteButton.className = 'material-symbols-outlined delete-page-button'
    deleteButton.innerText = 'close'

    deleteButton.addEventListener('click', evt => {
      evt.stopPropagation()
      tabHeader.remove()
      element.remove()

      const form = document.getElementById('display-group-form')
      form.dispatchEvent(new Event('change'))
      list.querySelector('*').click()
    })

    tabHeader.append(deleteButton)
  }

  list.insertBefore(tabHeader, document.getElementById('add-page'))

  tabHeader.addEventListener('click', () => {
    for (const tab of document.getElementsByClassName('tab')) {
      tabHeader.classList.add('selected')
      tab.hidden = true
    }

    for (const header of list.querySelectorAll('*')) {
      header.classList.remove('selected')
    }

    element.hidden = false
    tabHeader.classList.add('selected')
  })

  tabHeader.click()
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

  for (const templateDuration of template.querySelectorAll(
    '.template-duration'
  )) {
    templateDuration.name = `duration-page-${pageNo}`

    if (duration !== null) {
      templateDuration.value = duration
    }
  }

  for (const elt of template.querySelectorAll('[data-variable-name]')) {
    setupFormElement(elt, pageNo, properties)
  }

  for (const elt of template.querySelectorAll('.select-file-or-url')) {
    choiceOfFieldset(elt, elt.parentElement.parentElement, 'input-for', {
      fieldsetSelector: ':scope > input'
    })
  }

  const form = document.getElementById('display-group-form')

  for (const addBtn of fieldset.querySelectorAll('button.add-rss-feed')) {
    let variable = addBtn.dataset.variableName
    variable = variable.substring(0, variable.length)

    addBtn.addEventListener('click', () => addRssFeed(form, addBtn, pageNo, {}))

    for (const feed of properties[variable] || []) {
      const props = {}
      props[variable] = feed
      addRssFeed(form, addBtn, pageNo, props)
    }
  }

  setupPreview(pageNo, template.querySelector('iframe'))
  const appended = form.appendChild(template.firstElementChild)
  addTab(`Page ${pageNo + 1}`, appended, true)

  form.querySelector('button[type=submit]').disabled = false
  form.querySelector('#no-pages').hidden = true

  form.dispatchEvent(new Event('change'))
}

function addRssFeed (form, addBtn, pageNo, properties) {
  const container = addBtn.parentElement
  const template = container.querySelector('template').content.cloneNode(true)

  template
    .querySelector('button.delete-rss-feed')
    .addEventListener('click', evt => {
      form.dispatchEvent(new Event('change'))
      evt.target.parentElement.remove()
    })

  for (const elt of template.querySelectorAll('[data-variable-name]')) {
    setupFormElement(elt, pageNo, properties)
  }

  container.insertBefore(template, addBtn)
  form.dispatchEvent(new Event('change'))
}

function setupAddPage () {
  const btn = document.createElement('div')
  btn.id = 'add-page'

  const icon = document.createElement('span')
  icon.className = 'material-symbols-outlined add-page-plus'
  icon.innerText = 'add'

  btn.append(icon)
  btn.append('Add page')

  btn.addEventListener('click', () => addPage(null, null, {}))
  document.getElementById('tab-list').append(btn)
}

function setupPreview (pageNo, iframe) {
  const form = document.getElementById('display-group-form')

  async function change () {
    const deptId = form.dataset.departmentId
    let pagesParams

    if (pageNo === null) {
      // Preview all pages
      pagesParams = [...Array(pageNoCounter).keys()]
        .map(no => `preview_page=${no}`)
        .join('&')
    } else {
      pagesParams = `preview_page=${pageNo}`
    }

    const previewUrl = `/api/departments/${deptId}/preview_display?${pagesParams}`

    const res = await fetch(previewUrl, {
      method: 'post',
      body: new FormData(form)
    })

    iframe.srcdoc = await res.text()
  }

  form.addEventListener('change', change)
  change()
}
