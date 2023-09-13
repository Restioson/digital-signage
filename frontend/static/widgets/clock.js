import { WithRefresh } from './dynamic/with_refresh.mjs'
import { importFromNpm } from '../util.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
const { default: moment } = await importFromNpm('moment')

/**
 * A widget which displays the current datetime.
 */
export class Clock extends DeserializableWidget {
  /**
   * @param {string} format the datetime format to display (see https://momentjs.com/)
   */
  constructor ({ format = 'MMMM Do, h:mm:ss a' }) {
    super()
    this.format = format
    this.text = moment().format(this.format)
  }

  build () {
    return new WithRefresh({
      refresh: () => {
        const oldText = this.text
        this.text = moment().format(this.format)
        return this.text !== oldText
      },
      period: 1000,
      builder: () => {
        const text = document.createElement('div')
        text.innerHTML = this.text
        return text
      }
    })
  }

  static fromXML (tag) {
    return new Clock({ format: tag.attribute('format') })
  }

  className () {
    return 'clock'
  }
}
