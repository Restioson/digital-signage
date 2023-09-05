//import { QRCode } from 'https://cdn.skypack.dev/qrcodejs_es_module'
import { importFromNpm } from '../util.mjs'
import { Widget } from './widget.mjs'
const { default: QRCode } = await importFromNpm('qrcode')
const { default: CanvasRenderer } = await importFromNpm('canvas')

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
    const qrCodeContainer = document.createElement('A')
    try {
      var canvas = document.createElement('canvas')
      const options = {
        width: 100,
        height: 100
      }
      QRCode.toCanvas(canvas, this.url, options, function (error) {
        if (error) console.error(error)
        console.log('success!')
      })
      qrCodeContainer.append(canvas)
    } catch (error) {
      console.error('A error with the QRcode occurred:', error.message)
      const imageElement = document.createElement('img')
      imageElement.src = '/static/QRcode_failure.jpg'
      imageElement.width = 100
      imageElement.height = 100
      qrCodeContainer.append(imageElement)
    }
    return qrCodeContainer
  }
}
