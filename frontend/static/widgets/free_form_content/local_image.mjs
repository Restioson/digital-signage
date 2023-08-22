import { FreeFormContent } from './free_form_content.mjs'
import { Caption } from '../caption.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'

export class LocalImage extends FreeFormContent {
  constructor ({ id, caption }) {
    super({ id })
    this.caption = caption
  }

  static fromJSON (obj) {
    return new LocalImage({
      id: obj.id,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const img = document.createElement('img')
    img.src = `/api/content/${this.id}/blob`
    return new ContentAndCaption({
      content: img,
      caption: this.caption
    })
  }
}
