import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Container } from '../containers/container.mjs'
import { Caption } from '../caption.mjs'
import { Qrcode } from '../qrcode.mjs'
import { WithClasses } from '../with_classes.mjs'

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
    if (this.caption !== null) {
      // return new WithClasses({
      //   classList: ['link'],
      //   child: new ContentAndCaption({
      //   content: new Container({
      //     children: [iframe, new Qrcode({ url: this.url }),new Caption(this.caption)]
      //   }),
      //   caption: null
      // })})
      return new WithClasses({
        classList: ['link'],
        child: new Container({
          children: [
            iframe,
            new Qrcode({ url: this.url }),
            new Caption(this.caption)
          ]
        })
      })
    } else {
      return new WithClasses({
        classList: ['link'],
        child: new Container({
          children: [iframe, new Qrcode({ url: this.url })]
        })
      })
    }
  }
}
