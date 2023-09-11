import { Container } from './containers/container.mjs'
import { Visibility } from './visibility.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'

/**
 * A {@link Widget} to display a caption with a title and body. The title may be null, but the body may not.
 *
 * @augments Widget
 */
export class Caption extends DeserializableWidget {
  /**
   * @param {?string} title the title of the caption
   * @param {string} body the body of the caption
   */
  constructor ({ title, body }) {
    super()
    this.title = title
    this.body = body
  }

  /**
   * Deserialize this Caption from its given XML layout.
   *
   * @param {XMLTag} tag
   * @return {Caption}
   */
  static fromXML (tag) {
    return new Caption({
      title: tag.childAttribute('title'),
      body: tag.childAttribute('body')
    })
  }

  /**
   * Deserialize the caption from its JSON API representation.
   *
   * @param obj
   * @returns {Caption}
   */
  static fromJSON (obj) {
    return new Caption(obj)
  }

  /**
   * Deserialize the caption from its JSON API representation if that is not null or undefined, otherwise returning
   * `null`.
   *
   * @param obj
   * @returns {?Caption}
   */
  static maybeFromJSON (obj) {
    return obj ? Caption.fromJSON(obj) : null
  }

  build () {
    let title = null
    if (this.title) {
      title = document.createElement('p')
      title.className = 'caption-title'
      title.innerText = this.title
    }

    const body = document.createElement('p')
    body.className = 'caption-body'
    body.innerText = this.body

    return new Container({
      children: [
        new Visibility({
          visible: Boolean(title),
          child: title
        }),
        body
      ]
    })
  }

  className () {
    return 'caption'
  }
}
