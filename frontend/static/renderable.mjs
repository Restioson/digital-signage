import { AbstractClassError } from './util.js'

export class Renderable {
  constructor () {
    if (this.constructor === Renderable) {
      throw new AbstractClassError('Renderable', 'constructor')
    }
  }

  render () {
    throw new AbstractClassError('Renderable', 'render')
  }
}
