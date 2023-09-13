import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { deserializeWidgetFromTag } from '../deserializable/widget_deserialization_factory.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Container } from './container.mjs'

/**
 * A container which rotates between displaying all of its children, giving each a turn.
 *
 * Upon each turn, the child is rebuilt.
 */
export class RotatingContainer extends DeserializableWidget {
  constructor ({ children, period }) {
    super()
    this.children = children
    this.childIndex = -1
    this.period = period
  }

  build () {
    return new WithRefresh({
      refresh: async () => {
        this.childIndex = (this.childIndex + 1) % this.children.length
        return this.children.length !== 1
      },
      period: this.period,
      builder: () => {
        const index = this.childIndex !== -1 ? this.childIndex : 0
        return new Container({
          children:
            this.children.length > 0 ? [this.children[index]] : []
        })
      }
    })
  }

  className () {
    return 'rotation'
  }

  static fromXML (tag) {
    return new RotatingContainer({
      period: (parseInt(tag.attribute('secs-per-page')) || 10) * 1000,
      children: tag.children().map(deserializeWidgetFromTag)
    })
  }
}
