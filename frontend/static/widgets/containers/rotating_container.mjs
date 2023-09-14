import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { deserializeWidgetFromTag } from '../deserializable/widget_deserialization_factory.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Container } from './container.mjs'
import { Widget } from '../widget.mjs'

/**
 * A container which rotates between displaying all of its children, giving each a turn.
 *
 * Upon each turn, the child is set to show, but is not rebuilt.
 */
export class RotatingContainer extends DeserializableWidget {
  constructor ({ children, period }) {
    super()
    this.children = children
    this.renderedChildren = []
    this.childIndex = -1
    this.period = period
  }

  build () {
    return new WithRefresh({
      refresh: async () => {
        this.childIndex = (this.childIndex + 1) % this.children.length

        for (let i = 0; i < this.children.length; i++) {
          this.renderedChildren[i].hidden = this.childIndex !== i
        }

        return false // We just update the children's hidden property
      },
      period: this.period,
      builder: () => {
        this.renderedChildren = this.children.map(Widget.renderIfWidget)

        for (const child of this.renderedChildren.slice(1)) {
          child.hidden = true
        }

        return new Container({
          children: this.renderedChildren
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
