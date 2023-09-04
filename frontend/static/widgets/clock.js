import { WithRefresh } from './dynamic/with_refresh.mjs'
import { WithClasses } from './with_classes.mjs'
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
  }

  build () {
    return new WithRefresh({
      refresh: () => null,
      period: 1000,
      builder: () => {
        const text = document.createElement('div')
        text.innerText = moment().format(this.format)
        return new WithClasses({ classList: ['clock'], child: text })
      }
    })
  }

  static fromJSON (obj) {
    return new Clock({ format: obj.format })
  }
}
