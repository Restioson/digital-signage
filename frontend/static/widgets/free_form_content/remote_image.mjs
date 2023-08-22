import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'

/**
 * A piece of {@link FreeFormContent} which displays an image stored on a remote server.
 *
 * @augments FreeFormContent
 */
export class RemoteImage extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {URL} src the image's URL
   * @param {?Caption} caption the image's caption
   */
  constructor ({ id, src, caption }) {
    super({ id })
    this.src = src
    this.caption = caption
  }

  /**
   * Deserialize the RemoteImage from its JSON API representation.
   *
   * @param obj
   * @returns {RemoteImage}
   */
  static fromJSON (obj) {
    return new RemoteImage({
      id: obj.id,
      src: obj.src,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const img = document.createElement('img')
    img.src = this.src

    return new ContentAndCaption({
      content: img,
      caption: this.caption
    })
  }
}
