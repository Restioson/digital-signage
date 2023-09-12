import { Root } from './widgets/root.mjs'
import { deserializeWidgetFromXML } from './widgets/deserializable/widget_deserialization_factory.mjs'

export function main ({ department, layout }) {
  window.addEventListener('error', function (error) {
    const div = document.getElementById('errors')
    div.hidden = false
    const pre = document.createElement('pre')
    pre.innerText = error.message
    div.appendChild(pre)
  })

  Root.create({
    child: deserializeWidgetFromXML(layout),
    targetElement: document.getElementById('root'),
    departmentId: department
  })
}
