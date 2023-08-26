import { Widget } from './widget.mjs'
import { WithRefresh } from './with_refresh.mjs'
import { WithClasses } from './with_classes.mjs'
import moment from 'https://cdn.skypack.dev/moment'

/**
 * A widget which displays the current datetime.
 */
export class Clock extends Widget {
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
}
