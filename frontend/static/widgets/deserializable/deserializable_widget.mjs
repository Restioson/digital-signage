import { Widget } from '../widget.mjs'
import { AbstractClassError } from '../../util.mjs'

/**
 * A {@link Widget} which can be deserialized from JSON.
 *
 * @abstract
 */
export class DeserializableWidget extends Widget {
  /**
   * Deserialize the `DeserializableWidget` from its JSON representation.
   *
   * @returns {DeserializableWidget}
   * @param obj the JSON to deserialize
   * @abstract
   */
  static fromJSON (obj) {
    throw new AbstractClassError('DeserializableWidget', 'fromJSON()')
  }
}
