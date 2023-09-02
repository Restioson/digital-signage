import { QRCode } from 'https://cdn.skypack.dev/qrcodejs_es_module'
import { Widget } from './widget.mjs'

/**
 * A piece of {@qrcode Widget} which displays a link in the form of a qrcode.
 *
 * @augments Widget
 */
export class Qrcode extends Widget {
  /**
   * @param {URL} url the URL to display
   */
  constructor ({ url }) {
    super()
    this.url = url
  }

  build () {
    const qrCodeContainer = document.createElement('div')
    try {
      // This instance is made and ignored due to the nature of the library used so we ignore it in the lint
      // eslint-disable-next-line no-new
      new QRCode(qrCodeContainer, {
        text: this.url,
        width: 128,
        height: 128
      })
    } catch (error) {
      console.error('A error with the QRcode occurred:', error.message)
      const imageElement = document.createElement('img')
      imageElement.src = '/static/QRcode_failure.jpg'
      imageElement.width = 200
      imageElement.height = 200
      qrCodeContainer.append(imageElement)
    }
    return qrCodeContainer
  }
}
