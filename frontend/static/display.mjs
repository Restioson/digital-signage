import { Root } from './widgets/root.mjs'
import { deserializeWidget } from './widgets/deserializable/widget_deserialization_factory.mjs'

export function main (configJson) {
  const { department, layout } = JSON.parse(configJson)
  Root.create({
    child: deserializeWidget(layout),
    targetElement: document.getElementById('root'),
    departmentId: department
  })
}
