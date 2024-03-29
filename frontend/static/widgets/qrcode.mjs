import { importFromNpm } from '../util.mjs'
import { Widget } from './widget.mjs'
const { default: QRCode } = await importFromNpm('qrcode')

/**
 * A piece of {@link Widget} which displays a link in the form of a qrcode.
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

  static showError (canvas, error) {
    console.error('An error occurred with the QRCode:', error.message)
    canvas.classList.add('error')
    const imageElement = document.createElement('img')
    imageElement.src = '/static/QRcode_failure.jpg'

    imageElement.addEventListener('load', () => {
      canvas.getContext('2d').drawImage(imageElement, 0, 0, 100, 100)
    })
  }

  build () {
    const canvas = document.createElement('canvas')

    try {
      const options = {
        width: 100,
        height: 100
      }

      QRCode.toCanvas(canvas, this.url, options, function (error) {
        if (error) {
          Qrcode.showError(canvas, error)
        }
      })
    } catch (error) {
      Qrcode.showError(canvas, error)
    }

    return canvas
  }

  className () {
    return 'qrcode'
  }
}
