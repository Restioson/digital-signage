import { Container } from './container.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { deserializeWidgetFromTag } from '../deserializable/widget_deserialization_factory.mjs'
import { Caption } from '../caption.mjs'

/**
 * A {@link Widget} which displays some content alongside an optional {@link Caption}. The caption is hidden
 * if null.
 */
export class ContentAndCaption extends DeserializableWidget {
  /**
   * @param {HTMLElement | Widget} content the content to display
   * @param {Caption?} caption the caption to display
   */
  constructor ({ content, caption, flatten }) {
    super()
    this.content = content
    this.caption = caption
  }

  static fromXML (tag) {
    return new ContentAndCaption({
      content: deserializeWidgetFromTag(tag.namedChild('content')),
      caption: Caption.fromXML(tag.typedChild('caption'))
    })
  }

  build () {
    const children = [this.content]

    if (this.caption) {
      const caption = this.caption.render()
      const title = (caption.getElementsByClassName('caption-title') || [])[0]
      const body = (caption.getElementsByClassName('caption-body') || [])[0]

      if (title) {
        children.unshift(title)
      }

      if (body) {
        children.push(body)
      }
    }

    return new Container({ children })
  }

  className () {
    return 'content-and-caption'
  }
}
