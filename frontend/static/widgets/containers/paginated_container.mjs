import { Widget } from '../widget.mjs'
import { Container } from './container.mjs'

/**
 * A paginated container is like a container, but it shows only `pageSize` children at a time.
 *
 * The `page` attribute will automatically be wrapped according to the total number of pages.
 */
export class PaginatedContainer extends Widget {
  constructor ({ children, pageSize, page }) {
    super()
    this.children = children
    this.pageSize = pageSize
    this.page = page % Math.max(1, Math.ceil(this.children.length / pageSize))
  }

  build () {
    const start = this.page * this.pageSize
    const end = start + this.pageSize
    return new Container({
      children: this.children.slice(start, end)
    })
  }

  className () {
    return 'paginated-container'
  }
}
