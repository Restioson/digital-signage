import { AbstractClassError } from '../util.mjs'

/**
 * A `Widget` is an element which can be displayed on the screen.
 *
 * `Widget`s are composed of other `Widget`s and/or {@link HTMLElement}s through their {@link build} method. They should not store
 * any display-specific objects (objects relevant only to how a `Widget` is displayed e.g. elements), but rather
 * should store their logical state only. Any display-specific objects should be created in {@link build}.
 *
 * Since it is an abstract class, `build()` must be overriden by descendants to implement `Widget`. {@link render} must _not_
 * be overridden by descendants.
 *
 * @abstract
 */
export class Widget {
  constructor () {
    if (this.constructor === Widget) {
      throw new AbstractClassError('Widget', 'constructor')
    }
  }

  /**
   * Convert the `Widget` to its display representation. This can return a `Widget` itself, or an `HTMLElement`.
   *
   * @returns {Widget | HTMLElement}
   */
  build () {
    throw new AbstractClassError('Widget', 'build()')
  }

  /**
   * Render the {@link Widget} into an {@link HTMLElement}
   *
   * @returns {HTMLElement}
   */
  render () {
    const built = this.build()
    return built instanceof Widget ? built.render() : built
  }
}
