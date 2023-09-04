import { Widget } from './widget.mjs'
import { WithRefresh } from './dynamic/with_refresh.mjs'
import { AssertionError } from '../util.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
import { deserializeWidget } from './deserializable/widget_deserialization_factory.mjs'

/**
 * A {@link Widget} which (additively) applies the given CSS classes to its child.
 *
 * Since this modifies the child widget's HTML element in place, it should never be the parent of {@link WithRefresh},
 * as upon refresh, it will be replaced, and the classes will be lost.
 *
 * @augments Widget
 */
export class WithClasses extends DeserializableWidget {
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
    const rendered = Widget.renderIfWidget(this.child)
    if (this.classList) {
      rendered.classList.add(...this.classList)
    }

    return rendered
  }

  static fromJSON (obj) {
    return new WithClasses({
      child: deserializeWidget(obj.child),
      classList: obj.classList
    })
  }
}
