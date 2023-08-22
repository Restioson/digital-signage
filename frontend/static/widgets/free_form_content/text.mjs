import { FreeFormContent } from './free_form_content.mjs'
import { Container } from '../containers/container.mjs'

export class TextWidget extends FreeFormContent {
  constructor ({ id, title, body }) {
    super({ id })
    this.title = title
    this.body = body
  }

  static fromJSON (obj) {
    return new TextWidget(obj)
  }

  build () {
    const title = document.createElement('h3')
    const body = document.createElement('p')
    title.innerText = this.title
    body.innerText = this.body

    return new Container({ children: [title, body] })
  }
}
