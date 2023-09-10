import { Root } from './widgets/root.mjs'
import { deserializeWidgetFromXML } from './widgets/deserializable/widget_deserialization_factory.mjs'

export function main ({ department, layout }) {
  Root.create({
    child: deserializeWidgetFromXML(layout),
    targetElement: document.getElementById('root'),
    departmentId: department
  })
}
