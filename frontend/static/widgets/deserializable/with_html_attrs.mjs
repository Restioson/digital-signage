import { Widget } from '../widget.mjs'
import { AssertionError } from '../../util.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'

/**
 * A {@link Widget} which (additively) applies the given HTML attributes (only some supported) to its child.
 *
 * Since this modifies the child widget's HTML element in place, it should never be the parent of {@link WithRefresh},
 * as upon refresh, it will be replaced, and the classes will be lost.
 *
 * The class attribute is treated as special, and is merged additively with classes any from the widget itself.
 *
 * @augments Widget
 */
export class WithHTMLAttrs extends Widget {
  /**
   * @param {HTMLElement | Widget} child
   * @param {Map[string, *]} attributes the attributes to apply
   *
   * @throws {AssertionError} if the child is a {@link WithRefresh}
   */
  constructor ({ child, attributes = null }) {
    super()

    if (child instanceof WithRefresh) {
      throw new AssertionError(
        'WithHTMLAttrs cannot be the direct parent of WithRefresh (see docs)'
      )
    }

    this.child = child
    this.attributes = attributes || {}
  }

  build () {
    const rendered = Widget.renderIfWidget(this.child)

    for (const attribute in this.attributes) {
      if (attribute === 'class') {
        rendered.classList.add(...this.attributes.class.split(' '))
      } else {
        rendered[attribute] = this.attributes[attribute]
      }
    }

    return rendered
  }
}
