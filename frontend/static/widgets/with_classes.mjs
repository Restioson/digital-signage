import { Widget } from './widget.mjs'
import { WithHTMLAttrs } from './deserializable/with_html_attrs.mjs'

/**
 * A {@link Widget} which (additively) applies the given CSS classes to its child.
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
    return new WithHTMLAttrs({
      child: this.child,
      attributes: { class: this.classList.join(' ') }
    })
  }
}
