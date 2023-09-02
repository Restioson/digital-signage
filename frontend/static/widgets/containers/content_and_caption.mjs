import { Container } from './container.mjs'
import { Visibility } from '../visibility.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { deserializeWidget } from '../deserializable/widget_deserialization_factory.mjs'
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

  static fromJSON (obj) {
    return new ContentAndCaption({
      content: deserializeWidget(obj.content),
      caption: Caption.fromJSON(obj.caption)
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
}