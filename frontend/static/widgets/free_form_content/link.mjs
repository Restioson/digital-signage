import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Container } from '../containers/container.mjs'
import { Caption } from '../caption.mjs'
import { Qrcode } from '../qrcode.mjs'

/**
 * A piece of {@link FreeFormContent} which displays the embedded content of a link along with its QRcode and a potential caption.
 *
 * @augments FreeFormContent
 */
export class Link extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {URL} url the URL to embed in the iFrame
   * @param {?Caption} caption the link's caption
   */
  constructor ({ id, url, caption }) {
    super({ id })
    this.url = url
    this.caption = caption
  }

  /**
   * Deserialize the Link from its JSON API representation.
   *
   * @param obj
   * @returns {Link}
   */
  static fromJSON (obj) {
    return new Link({
      id: obj.id,
      url: obj.url,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const iframe = document.createElement('iframe')
    iframe.src = this.url
    iframe.width = '400'
    iframe.height = '300'
    return new ContentAndCaption({
      content: new Container({
        children: [iframe, new Qrcode({ url: this.url })]
      }),
      caption: this.caption
    })
  }
}
