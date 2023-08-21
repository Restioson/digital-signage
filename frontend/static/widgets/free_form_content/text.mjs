import { FreeFormContent } from './free_form_content.mjs'

export class TextWidget extends FreeFormContent {
  constructor ({ id, title, body }) {
    super({ id })
    this.title = title
    this.body = body
  }

  static fromJSON (obj) {
    return new TextWidget(obj)
  }

  render () {
    const container = document.createElement('div')
    const title = document.createElement('h3')
    const body = document.createElement('p')
    title.innerText = this.title
    body.innerText = this.body
    container.append(title, body)
    return container
  }
}
