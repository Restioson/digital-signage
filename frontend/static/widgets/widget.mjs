import { AbstractClassError } from '../util.js'
import { Renderable } from '../renderable.mjs'

export class Widget extends Renderable {
  constructor () {
    super()
    if (this.constructor === Widget) {
      throw new AbstractClassError('Widget', 'constructor')
    }
  }

  build () {
    throw new AbstractClassError('Widget', 'build()')
  }

  async refresh () {}

  render () {
    return this.build().render()
  }
}
