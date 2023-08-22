import { Widget } from './widget.mjs'
import { WithClasses } from './with_classes.mjs'
import { Container } from './containers/container.mjs'
import { Visibility } from './visibility.mjs'

/**
 * A {@link Widget} to display a caption with a title and body. The title may be null, but the body may not.
 *
 * @augments Widget
 */
export class Caption extends Widget {
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
   * @param {?Object} obj
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

    return new WithClasses({
      classList: ['content-caption'],
      child: new Container({
        children: [
          new Visibility({
            visible: Boolean(title),
            child: title
          }),
          body
        ]
      })
    })
  }
}
