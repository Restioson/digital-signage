import { Widget } from '../widget.mjs'
import { AbstractClassError } from '../../util.js'

export class FreeFormContent extends Widget {
  constructor ({ id }) {
    super()

    if (this.constructor === FreeFormContent) {
      throw new AbstractClassError('FreeFormContentWidget', 'constructor')
    }

    this.id = id
  }
}
