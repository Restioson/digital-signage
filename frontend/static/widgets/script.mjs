import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'

/**
 * A widget which displays an HTML script element.
 */
export class ScriptWidget extends DeserializableWidget {
  constructor ({ element }) {
    super()
    this.element = element
  }

  static fromXML (tag) {
    const script = document.createElement('script')
    script.appendChild(document.createTextNode(tag.text()))

    for (const attr of tag.attributes) {
      script[attr] = tag[attr]
    }

    return new ScriptWidget({ element: script })
  }

  build () {
    return this.element
  }

  className () {
    return null
  }
}
