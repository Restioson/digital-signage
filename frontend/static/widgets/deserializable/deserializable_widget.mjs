import { Widget } from '../widget.mjs'
import { AbstractClassError } from '../../util.mjs'

/**
 * A {@link Widget} which can be deserialized from JSON.
 *
 * @abstract
 */
export class DeserializableWidget extends Widget {
  /**
   * Deserialize the `DeserializableWidget` from its XML object representation.
   *
   * @returns {DeserializableWidget}
   * @param {XMLTag} tag the XML tag to deserialize
   * @abstract
   */
  static fromXML (tag) {
    throw new AbstractClassError('DeserializableWidget', 'fromXML()')
  }
}
