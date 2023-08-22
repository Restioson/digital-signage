import { Widget } from '../widget.mjs'
import { Container } from './container.mjs'
import { Visibility } from '../visibility.mjs'

/**
 * A {@link Widget} which displays some content alongside an optional {@link Caption}. The caption is hidden
 * if null.
 */
export class ContentAndCaption extends Widget {
  /**
   * @param {HTMLElement | Widget} content the content to display
   * @param {Caption?} caption the caption to display
   */
  constructor ({ content, caption }) {
    super()
    this.content = content
    this.caption = caption
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
