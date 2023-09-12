import { Widget } from '../widget.mjs'

/**
 * A {@link Widget} which (additively) applies the given HTML attributes (only some supported) to its child.
 *
 * The class attribute is treated as special, and is merged additively with classes any from the widget itself.
 *
 * @augments Widget
 */
export class WithHTMLAttrs extends Widget {
  /**
   * @param {HTMLElement | Widget} child
   * @param {Map[string, *]} attributes the attributes to apply
   */
  constructor ({ child, attributes = null }) {
    super()

    this.child = child
    this.attributes = attributes || {}
  }

  build () {
    const rendered = Widget.renderIfWidget(this.child)

    for (const attribute in this.attributes) {
      if (attribute === 'class' && this.attributes.class) {
        rendered.classList.add(...this.attributes.class.split(' '))
      } else {
        rendered[attribute] = this.attributes[attribute]
      }
    }

    return rendered
  }

  className () {
    return null
  }
}
