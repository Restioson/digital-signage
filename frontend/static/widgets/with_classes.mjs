import { Widget } from './widget.mjs'

/**
 * A {@link Widget} which (additively) applies the given CSS classes to its child.
 *
 * Since this modifies the child widget's HTML element in place, it should never be the parent of {@link WithRefresh},
 * as upon refresh, it will be replaced, and the classes will be lost.
 *
 * @augments Widget
 */
export class WithClasses extends Widget {
  /**
   * @param {HTMLElement | Widget} child
   * @param {string[]} classList
   */
  constructor ({ child, classList = null }) {
    super()
    this.child = child
    this.classList = classList
  }

  build () {
    const rendered =
      this.child instanceof Widget ? this.child.render() : this.child
    if (this.classList) {
      rendered.classList.add(...this.classList)
    }

    return rendered
  }
}
