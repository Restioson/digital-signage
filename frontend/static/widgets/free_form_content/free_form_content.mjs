import { AbstractClassError } from '../../util.mjs'
import { Widget } from '../widget.mjs'

/**
 * A {@link Widget} displaying a piece of free form content.
 *
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

  /**
   * Deserialize this piece of content from its HTTP JSON API representation.
   *
   * @return {FreeFormContent} the deserialized content
   */
  static fromJSON (obj) {
    throw new AbstractClassError('FreeFormContentWidget', 'fromJSON')
  }
}
