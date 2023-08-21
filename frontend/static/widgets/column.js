import { Widget } from '../widget.mjs'

export class Column extends Widget {
  constructor ({ children, classList = null }) {
    super()
    this.children = children
    this.classList = classList
  }

  render () {
    const container = document.createElement('div')
    container.append(this.children.map(child => child.render()))
    container.classList = this.classList

    return container
  }
}
