import { Widget } from '../widget.mjs'

export class HtmlWidget extends Widget {
  constructor (element) {
    super()
    this.element = element
  }

  render () {
    return this.element
  }
}
