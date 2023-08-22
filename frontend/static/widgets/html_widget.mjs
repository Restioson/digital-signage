import { Renderable } from '../renderable.mjs'

export class HtmlRenderable extends Renderable {
  constructor (element) {
    super()
    this.element = element
  }

  render () {
    return this.element
  }
}
