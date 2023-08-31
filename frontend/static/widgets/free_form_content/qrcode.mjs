import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'
import { QRCode } from 'https://cdn.skypack.dev/qrcodejs_es_module'

/**
 * A piece of {@qrcode FreeFormContent} which displays a link in the form of a qrcode.
 *
 * @augments FreeFormContent
 */
export class Qrcode extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {URL} url the URL to display
   * @param {?Caption} caption the qrcode's caption
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
   * @returns {Qrcode}
   */
  static fromJSON (obj) {
    return new Qrcode({
      id: obj.id,
      url: obj.url,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  static qrcodegen (url) {
    const qrCodeContainer = document.createElement('div')
    qrCodeContainer.style.width = '125px'
    qrCodeContainer.style.height = '125px'
    console.log(QRCode)
    new QRCode(qrCodeContainer, {
      text: url,
      width: 128,
      height: 128
    })
    return qrCodeContainer
  }

  build () {
    const qrCodeContainer = Qrcode.qrcodegen(this.url)
    return new ContentAndCaption({
      content: qrCodeContainer,
      caption: this.caption
    })
  }
}
