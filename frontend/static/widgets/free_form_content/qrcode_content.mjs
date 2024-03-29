import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'
import { FreeFormContent } from './free_form_content.mjs'
import { Qrcode } from '../qrcode.mjs'

/**
 * A piece of {@link FreeFormContent} which displays a link in the form of a qrcode with a potential caption.
 *
 * @augments FreeFormContent
 */
export class QrcodeContent extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {URL} url the URL to display
   * @param {?Caption} caption the link's caption
   */
  constructor ({ id, url, caption }) {
    super({ id })
    this.url = url
    this.caption = caption
  }

  /**
   * Deserialize the qrcode from its JSON API representation.
   *
   * @param obj
   * @returns {QrcodeContent}
   */
  static fromJSON (obj) {
    return new QrcodeContent({
      id: obj.id,
      url: obj.url,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    return new ContentAndCaption({
      content: new Qrcode({ url: this.url }),
      caption: this.caption
    })
  }

  className () {
    return 'free-form-content qrcode-content'
  }
}
