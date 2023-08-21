import { Widget } from '../widget.mjs'

export class Column extends Widget {
  constructor ({ children, classList = null }) {
    super()
    this.children = children
    this.classList = classList
  }

  async refresh () {
    for (const child of this.children) {
      await child.refresh()
    }
  }

  render () {
    const container = document.createElement('div')

    for (const child of this.children) {
      container.append(child.render())
    }

    if (this.classList) {
      container.classList = this.classList
    }

    return container
  }
}
