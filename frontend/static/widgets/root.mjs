import { RootAlreadyExistsError } from '../util.mjs'

let root

/**
 * A collection of exports only to be used when testing
 */
export const testExports = { destroyRoot }

/**
 * Destroy the root. Used only in testing for teardown.
 */
function destroyRoot () {
  if (root && root.mutationObserver) {
    root.mutationObserver.disconnect()
  }

  root = null
}

/**
 * The global root element of the page. This can only be created once, through its {@link create} method.
 */
export class Root {
  constructor (departmentId, displayContentStream) {
    this.departmentId = departmentId
    this.displayContentStream = displayContentStream
    this.watchedElements = []
  }

  /**
   * Create and render the widget tree into the given HTML element. This element's children will be replaced, but it
   * will be left intact.
   * @param {Widget} child
   * @param {HTMLElement} targetElement
   * @param {number} departmentId the departments ID of this display
   * @param {number} displayContentStream the inherent content stream ID for this display
   */
  static create ({ child, targetElement, departmentId, displayContentStream }) {
    if (root) {
      throw new RootAlreadyExistsError()
    } else {
      root = new Root(departmentId, displayContentStream)
    }

    root.mutationObserver = new window.MutationObserver(
      (mutations, observer) => {
        if (!root) {
          observer.disconnect()
          return
        }

        for (const { element, onAdd } of root.watchedElements) {
          if (isInDocument(element)) {
            onAdd()
          }
        }

        root.watchedElements = []
      }
    )

    root.observeRoot(targetElement)
    targetElement.replaceChildren(child.render())
  }

  static getInstance () {
    return root
  }

  observeRoot (root) {
    this.mutationObserver.observe(root, {
      childList: true,
      subtree: true
    })
  }

  watchElement ({ element, onAdd }) {
    this.watchedElements.push({ element, onAdd })
  }

  getDepartment () {
    return this.departmentId
  }

  getDisplayContentStream () {
    return this.displayContentStream
  }
}

function isInDocument (element) {
  let currentElement = element

  while (currentElement && currentElement.parentNode) {
    if (currentElement.parentNode === document) {
      return true
    } else if (currentElement.parentNode instanceof window.DocumentFragment) {
      currentElement = currentElement.parentNode.host
    } else {
      currentElement = currentElement.parentNode
    }
  }
  return false
}
