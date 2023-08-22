import { Widget } from '../widget.mjs'

/**
 * A {@link Widget} which just displays its children as children of an {@link HTMLDivElement}.
 */
export class Container extends Widget {
  /**
   * @param {HTMLElement | Widget} children the children to display
   */
  constructor ({ children }) {
    super()
    this.children = children
  }

  build () {
    const container = document.createElement('div')

    for (const child of this.children) {
      container.append(child instanceof Widget ? child.render() : child)
    }

    return container
  }
}
