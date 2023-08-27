import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'

/**
 * A piece of {@qrcode FreeFormContent} which displays a link in the form of a qrcode.
 *
 * @augments FreeFormContent
 */
export class qrcode extends FreeFormContent {
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
   * @returns {qrcode}
   */
  static fromJSON (obj) {
    return new qrcode({
      id: obj.id,
      url: obj.url,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  static qrcodegen (url) {
    const qrcodecontainer = document.createElement('div')
    qrcodecontainer.style.width = `125px`; 
    qrcodecontainer.style.height = `125px`; 
    new QRCode(qrcodecontainer, {
      text: url,
      width: 128,
      height: 128,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    })
    return qrcodecontainer
  }

  build () {
    const qrcodecontainer = qrcode.qrcodegen(this.url)
    return new ContentAndCaption({
      content: qrcodecontainer,
      caption: this.caption
    })
  }
}
