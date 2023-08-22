import { Widget } from '../widget.mjs'
import { AbstractClassError } from '../../util.mjs'

/**
 * A {@link Widget} displaying a piece of free form content.
 *
 * @augments Widget
 * @abstract
 */
export class FreeFormContent extends Widget {
  /**
   * @param {int} id the ID of the content
   */
  constructor ({ id }) {
    super()

    if (this.constructor === FreeFormContent) {
      throw new AbstractClassError('FreeFormContentWidget', 'constructor')
    }

    this.id = id
  }
}
