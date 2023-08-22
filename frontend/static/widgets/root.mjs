import { RootAlreadyExistsError } from '../util.mjs'

let root

/**
 * The global root element of the page. This can only be created once, through its {@link create} method.
 */
export class Root {
  constructor () {
    this.postRenderCallbacks = []
  }

  /**
   * Create and render the widget tree into the given HTML element. This element's children will be replaced, but it
   * will be left intact.
   * @param {Widget} child
   * @param {HTMLElement} targetElement
   */
  static create ({ child, targetElement }) {
    if (root) {
      throw new RootAlreadyExistsError()
    } else {
      root = new Root()
    }

    targetElement.replaceChildren(child.render())

    for (const callback of root.postRenderCallbacks) {
      callback()
    }
  }

  static getInstance () {
    return root
  }

  addPostRenderCallback (callback) {
    this.postRenderCallbacks.push(callback)
  }
}
