import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'

/**
 * A widget which displays a given HTML element.
 */
export class HtmlWidget extends DeserializableWidget {
  constructor ({ element }) {
    super()
    this.element = element
  }

  static fromXML (tag) {
    const div = document.createElement('div')
    div.innerHTML = tag.text()

    if (div.children.length === 1) {
      return new HtmlWidget({ element: div.children[0] })
    } else {
      return new HtmlWidget({ element: div })
    }
  }

  build () {
    return this.element
  }

  className () {
    return 'html'
  }
}
