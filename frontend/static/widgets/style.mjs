import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'

/**
 * A widget which displays an HTML style element.
 */
export class StyleWidget extends DeserializableWidget {
  constructor ({ element }) {
    super()
    this.element = element
  }

  static fromXML (tag) {
    const style = document.createElement('style')
    style.appendChild(document.createTextNode(tag.text()))

    for (const attr of tag.attributes) {
      style[attr] = tag[attr]
    }

    return new StyleWidget({ element: style })
  }

  build () {
    return this.element
  }

  className () {
    return null
  }
}
