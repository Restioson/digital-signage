import { AbstractClassError } from '../../util.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'

/**
 * A {@link Widget} displaying a piece of free form content.
 *
 * @abstract
 */
export class FreeFormContent extends DeserializableWidget {
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
