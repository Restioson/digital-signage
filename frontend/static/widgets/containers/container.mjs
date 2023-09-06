import { Widget } from '../widget.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { deserializeWidget } from '../deserializable/widget_deserialization_factory.mjs'

/**
 * A {@link Widget} which just displays its children as children of an {@link HTMLDivElement}.
 */
export class Container extends DeserializableWidget {
  /**
   * @param {(HTMLElement | Widget)[]} children the children to display
   */
  constructor ({ children }) {
    super()
    this.children = children
  }

  build () {
    const container = document.createElement('div')

    for (const child of this.children) {
      container.appendChild(Widget.renderIfWidget(child))
    }

    return container
  }

  static fromJSON (obj) {
    return new Container({ children: obj.children.map(deserializeWidget) })
  }
}
