import { Widget } from './widget.mjs'

export class Visibility extends Widget {
  constructor ({ visible, child }) {
    super()
    this.visible = visible
    this.child = child
  }

  build () {
    if (this.visible) {
      return this.child
    } else {
      const placeholder = document.createElement('div')
      placeholder.hidden = true
      return placeholder
    }
  }
}
