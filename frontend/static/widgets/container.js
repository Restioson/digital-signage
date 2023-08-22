import { Renderable } from '../renderable.mjs'

export class Container extends Renderable {
  constructor ({ children }) {
    super()
    this.children = children
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

    return container
  }
}
