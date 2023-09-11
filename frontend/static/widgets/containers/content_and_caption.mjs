import { Container } from './container.mjs'
import { Visibility } from '../visibility.mjs'
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
  constructor ({ content, caption }) {
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
    return new Container({
      children: [
        this.content,
        new Visibility({
          visible: Boolean(this.caption),
          child: this.caption
        })
      ]
    })
  }

  className () {
    return 'content-and-caption'
  }
}
