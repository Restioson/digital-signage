import { RootAlreadyExistsError } from '../util.mjs'

let root

export class Root {
  constructor () {
    this.postRenderCallbacks = []
  }

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
