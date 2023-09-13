/**
 * A WatchingElement is a custom HTML that calls the given callbacks upon connection and disconnection from the DOM.
 */
export class WatchingElement extends window.HTMLElement {
  constructor (props) {
    super()
    this.onConnect = props.onConnect
    this.onDisconnect = props.onDisconnect
    this.savedAttrs = {}
  }

  connectedCallback () {
    // Transfer own attributes to child to make this 'invisible'
    for (const attr of this.getAttributeNames()) {
      this.savedAttrs[attr] = super.getAttribute(attr)
      this.removeAttribute(attr)
    }

    this.passAttrsToChild()

    if (this.onConnect) {
      this.onConnect()
    }
  }

  appendChild (node) {
    const ret = super.appendChild(node)
    this.passAttrsToChild()
    return ret
  }

  replaceChildren (...nodes) {
    super.replaceChildren(...nodes)
    this.passAttrsToChild()
  }

  // Transfer own attributes to child to make this 'invisible'
  setAttribute (qualifiedName, value) {
    this.savedAttrs[qualifiedName] = value
    this.passAttrsToChild()
  }

  getAttribute (qualifiedName) {
    return this.savedAttrs[qualifiedName]
  }

  passAttrsToChild () {
    for (const attr in this.savedAttrs) {
      if (attr === 'class') {
        const childClass = this.firstElementChild.getAttribute('class') || ''
        const classSet = new Set([
          ...childClass.split(' '),
          ...this.savedAttrs.class.split(' ')
        ])
        const className = Array.from(classSet)
          .filter(s => s)
          .join(' ')
        this.firstElementChild.setAttribute('class', className)
      } else {
        this.firstElementChild.setAttribute(attr, this.savedAttrs[attr])
      }
    }
  }

  disconnectedCallback () {
    if (this.onDisconnect) {
      this.onDisconnect()
    }
  }
}
