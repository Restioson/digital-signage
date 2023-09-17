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
  /**
   *
   * @param {{child: HTMLElement|Widget, refreshOnSwitch: boolean, duration: number}[]} children the children and their settings
   */
  constructor ({ children }) {
    super()
    this.children = children
    this.renderedChildren = []
    this.timeSpentAtChild = -1
    this.childIndex = 0
  }

  build () {
    return new WithRefresh({
      refresh: async () => {
        if (this.children.length <= 1) {
          return false
        }

        this.timeSpentAtChild += 1

        if (this.timeSpentAtChild >= this.children[this.childIndex].duration) {
          this.timeSpentAtChild = 0
          this.childIndex = (this.childIndex + 1) % this.children.length

          const child = this.children[this.childIndex]

          if (child.refreshOnSwitch) {
            const old = this.renderedChildren[this.childIndex]
            this.renderedChildren[this.childIndex] = Widget.renderIfWidget(
              child.child
            )
            old.replaceWith(this.renderedChildren[this.childIndex])
          }
        }

        for (let i = 0; i < this.children.length; i++) {
          this.renderedChildren[i].hidden = this.childIndex !== i
        }

        return false // We just update the children's hidden property
      },
      period: 1000,
      builder: () => {
        this.renderedChildren = this.children.map(child =>
          Widget.renderIfWidget(child.child)
        )

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
    const defaultPeriod = parseInt(tag.attribute('secs-per-page')) || 10

    return new RotatingContainer({
      children: tag.children().map(child => {
        // HACK: pages are wrapped in <dummy> but the template also needs to pass up the on-show attribute
        const onShowAttrChild =
          child.type === 'dummy' ? child.firstChild() : child

        return {
          child: deserializeWidgetFromTag(child),
          refreshOnSwitch: onShowAttrChild.attribute('on-show') === 'refresh',
          duration: parseInt(child.attribute('duration')) || defaultPeriod
        }
      })
    })
  }
}
