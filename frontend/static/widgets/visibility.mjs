import { Widget } from './widget.mjs'

/**
 * A `Widget` which displays the given `child` if `visible` is true. If `visible` is false, a placeholder `<div hidden>`
 * is emitted.
 */
export class Visibility extends Widget {
  /**
   * @param {boolean} visible whether to display the child
   * @param {Widget | HTMLElement} child the child to display when `visible` is true
   */
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
