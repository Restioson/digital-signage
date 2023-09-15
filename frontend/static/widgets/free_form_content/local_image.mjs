import { FreeFormContent } from './free_form_content.mjs'
import { Caption } from '../caption.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'

/**
 * A piece of {@link FreeFormContent} which displays an image stored on the CampuSign server.
 *
 * @augments FreeFormContent
 */
export class LocalImage extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {?Caption} caption the image's caption
   */
  constructor ({ id, caption }) {
    super({ id })
    this.caption = caption
  }

  /**
   * Deserialize the LocalImage from its JSON API representation.
   *
   * @param obj
   * @returns {LocalImage}
   */
  static fromJSON (obj) {
    return new LocalImage({
      id: obj.id,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const img = document.createElement('img')
    img.src = `/api/content/${this.id}/blob`
    return new ContentAndCaption({
      content: img,
      caption: this.caption
    })
  }

  className () {
    return 'free-form-content image'
  }
}
