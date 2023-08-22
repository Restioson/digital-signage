import { Widget } from '../widget.mjs'

export class Container extends Widget {
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
