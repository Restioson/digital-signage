import { importFromNpm } from '../util.mjs'
import { Widget } from './widget.mjs'
const { default: QRCode } = await importFromNpm('qrcode')

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

  static showError (canvas) {
    const imageElement = document.createElement('img')
    imageElement.src = '/static/QRcode_failure.jpg'

    imageElement.addEventListener('load', () => {
      console.log('drawing')
      canvas.getContext('2d').drawImage(imageElement, 0, 0, 100, 100)
      console.log('drawn')
    })
  }

  build () {
    const qrCodeContainer = document.createElement('A')
    const canvas = document.createElement('canvas')
    qrCodeContainer.append(canvas)

    try {
      const options = {
        width: 100,
        height: 100
      }

      QRCode.toCanvas(canvas, null, options, function (error) {
        if (error) {
          console.error('An error occurred with the QRCode:', error.message)
          Qrcode.showError(canvas)
        }
      })
    } catch (error) {
      console.error('An error occurred with the QRCode:', error.message)
      Qrcode.showError(canvas)
    }
    return qrCodeContainer
  }
}
