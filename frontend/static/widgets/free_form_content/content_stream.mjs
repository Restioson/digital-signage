import { Widget } from '../../widget.mjs'
import { Column } from '../column.js'
import { deserializeFreeFormContent } from './free_form_content_factory.mjs'
import { WithClasses } from '../with_classes.mjs'

export class ContentStream extends Widget {
  constructor () {
    super()
    this.content = []
  }

  async refresh () {
    const contentUpdate = await fetch('/api/content').then(res => res.json())
    this.content = contentUpdate.content
  }

  build () {
    return new WithClasses({
      classList: ['content-stream'],
      child: new Column({
        children: this.content.map(content =>
          deserializeFreeFormContent(content)
        )
      })
    })
  }
}
