import { FreeFormContent } from './free_form_content.mjs'
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

    const children = [iframe, new Qrcode({ url: this.url })]

    if (this.caption) {
      const caption = this.caption.render()
      const title = (caption.getElementsByClassName('caption-title') || [])[0]
      const body = (caption.getElementsByClassName('caption-body') || [])[0]

      if (title) {
        children.unshift(title)
      }

      if (body) {
        children.push(body)
      }
    }

    return new Container({ children })
  }

  className () {
    return 'free-form-content link'
  }
}
