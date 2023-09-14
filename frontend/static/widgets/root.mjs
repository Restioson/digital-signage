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
  constructor (departmentId) {
    this.departmentId = departmentId
    this.watchedElements = []
  }

  /**
   * Create and render the widget tree into the given HTML element. This element's children will be replaced, but it
   * will be left intact.
   * @param {Widget} child
   * @param {HTMLElement} targetElement
   * @param {number} departmentId the departments ID of this display group
   */
  static create ({ child, targetElement, departmentId }) {
    if (root) {
      throw new RootAlreadyExistsError()
    } else {
      root = new Root(departmentId)
    }

    this.mutationObserver = new window.MutationObserver(
      (mutations, observer) => {
        if (!root) {
          observer.disconnect()
          return
        }

        for (const { element, onAdd } of root.watchedElements) {
          const isAdded = mutations.some(mut =>
            Array.from(mut.addedNodes).some(node => node.contains(element))
          )

          if (isAdded) {
            onAdd()
          }
        }

        root.watchedElements = []
      }
    )

    this.mutationObserver.observe(targetElement, {
      childList: true,
      subtree: true
    })
    targetElement.replaceChildren(child.render())
  }

  static getInstance () {
    return root
  }

  watchElement ({ element, onAdd, onRemove }) {
    this.watchedElements.push({ element, onAdd })
  }

  getDepartment () {
    return this.departmentId
  }
}
