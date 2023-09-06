import { Root } from './widgets/root.mjs'
import { deserializeWidget } from './widgets/deserializable/widget_deserialization_factory.mjs'

export function main (layoutJson) {
  Root.create({
    child: deserializeWidget(JSON.parse(layoutJson)),
    targetElement: document.getElementById('root')
  })
}
