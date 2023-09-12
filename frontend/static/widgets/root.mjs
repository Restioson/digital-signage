import { RootAlreadyExistsError } from '../util.mjs'
import { WatchingElement } from './dynamic/watching_element.mjs'

let root

/**
 * A collection of exports only to be used when testing
 */
export const testExports = { destroyRoot }

/**
 * Destroy the root. Used only in testing for teardown.
 */
function destroyRoot () {
  root = null
}

/**
 * The global root element of the page. This can only be created once, through its {@link create} method.
 */
export class Root {
  constructor (departmentId) {
    this.departmentId = departmentId
    this.postRenderCallbacks = []
  }

  /**
   * Create and render the widget tree into the given HTML element. This element's children will be replaced, but it
   * will be left intact.
   * @param {Widget} child
   * @param {HTMLElement} targetElement
   * @param {number} departmentId the departments ID of this display group
   */
  static create ({ child, targetElement, departmentId }) {
    try {
      window.customElements.define('watching-element', WatchingElement)
    } catch {}

    if (root) {
      throw new RootAlreadyExistsError()
    } else {
      root = new Root(departmentId)
    }

    targetElement.replaceChildren(child.render())
  }

  static getInstance () {
    return root
  }

  getDepartment () {
    return this.departmentId
  }
}
