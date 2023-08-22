import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'

export class RemoteImage extends FreeFormContent {
  constructor ({ id, src, caption }) {
    super({ id })
    this.src = src
    this.caption = caption
  }

  static fromJSON (obj) {
    return new RemoteImage({
      id: obj.id,
      src: obj.src,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const img = document.createElement('img')
    img.src = this.src

    return new ContentAndCaption({
      content: img,
      caption: this.caption
    })
  }
}
