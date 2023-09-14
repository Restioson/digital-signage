import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { deserializeWidgetFromTag } from '../deserializable/widget_deserialization_factory.mjs'
import { WithRefresh } from './with_refresh.mjs'

/**
 * Rebuild the child no matter what every `period` miliseconds.
 */
export class StaticRefresh extends DeserializableWidget {
  constructor ({ child, period }) {
    super()
    this.child = child
    this.period = period
  }

  build () {
    return new WithRefresh({
      refresh: () => true,
      period: this.period,
      builder: () => this.child
    })
  }

  static fromXML (tag) {
    return new StaticRefresh({
      child: deserializeWidgetFromTag(tag.firstChild()),
      period: (tag.attribute('period') || 5 * 60) * 1000
    })
  }

  className () {
    return 'refresh'
  }
}
