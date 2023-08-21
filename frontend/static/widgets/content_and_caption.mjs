import { Widget } from '../widget.mjs'
import { Column } from './column.js'

export class ContentAndCaption extends Widget {
  constructor ({ content, caption }) {
    super()
    this.content = content
    this.caption = caption
  }

  build () {
    return new Column({
      children: this.caption ? [this.content, this.caption] : [this.content]
    })
  }
}
