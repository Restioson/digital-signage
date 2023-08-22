import { AbstractClassError } from '../util.mjs'

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
    const built = this.build()
    return built instanceof Widget ? built.render() : built
  }
}
