import { Widget } from '../widget.mjs'

/**
 * A {@link Widget} which will cache its children and only rebuild them if their ID (provided by the {@link id} callback)
 * has changed. This is only useful in conjunction with {@link WithRefresh}, since otherwise the widget is built
 * exactly once.
 *
 * This, unlike most widgets, should be stored as state within the parent widget, since it needs to be rebuilt without
 * being recreated.
 *
 * @see WithRefresh
 * @extends Widget
 */
export class CachingContainer extends Widget {
  /**
   * @param {function((Widget | HTMLElement)): *} getId get the ID of the given child
   */
  constructor ({ getId }) {
    super()

    /**
     * The children of this container. It should be updated before a rebuild. It is initialised to `[]`.
     *
     * @public
     * @type {(Widget | HTMLElement)[]} children
     */
    this.children = []

    /**
     * The cached children's display representation.
     *
     * @private
     * @type {Map<*, HTMLElement>}
     */
    this.cache = new Map()

    /**
     * The function to get the ID of a given child.
     *
     * @type {function((Widget|HTMLElement)): *}
     * @private
     */
    this.getId = getId
  }

  build () {
    const container = document.createElement('div')

    const newCache = new Map()
    for (const child of this.children) {
      const id = this.getId(child)
      const built = this.cache.get(id) || Widget.renderIfWidget(child)
      newCache.set(id, built)
      container.appendChild(built)
    }

    this.cache = newCache

    return container
  }
}
