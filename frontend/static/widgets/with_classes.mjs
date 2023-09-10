import { Widget } from './widget.mjs'
import { WithRefresh } from './dynamic/with_refresh.mjs'
import { AssertionError } from '../util.mjs'
import { WithHTMLAttrs } from './deserializable/with_html_attrs.mjs'

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
   *
   * @throws {AssertionError} if the child is a {@link WithRefresh}
   */
  constructor ({ child, classList = null }) {
    super()

    if (child instanceof WithRefresh) {
      throw new AssertionError(
        'WithClasses cannot be the direct parent of WithRefresh (see docs)'
      )
    }

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
