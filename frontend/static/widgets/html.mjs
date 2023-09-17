import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
import { Root } from './root.mjs'

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
    const scripts = this.element.querySelectorAll('script')
    Root.getInstance().watchElement({
      element: this.element,
      onAdd: () => {
        for (const script of this.element.querySelectorAll('script')) {
          const cloned = document.createElement('script')

          Array.from(script.attributes).forEach(attribute => {
            cloned.setAttribute(attribute.name, attribute.value)
          })

          cloned.text = script.text
          script.parentNode.replaceChild(cloned, script)
        }
      }
    })

    return this.element
  }

  className () {
    return 'html'
  }
}
