import { AbstractClassError } from './util.js'

export class Widget {
  constructor () {
    if (this.constructor === Widget) {
      throw new AbstractClassError('Widget', 'constructor')
    }
  }

  build () {
    throw new AbstractClassError('Widget', 'build()')
  }

  render () {
    return this.build().render()
  }
}
