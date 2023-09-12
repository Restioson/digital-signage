/**
 * A WatchingElement is a custom HTML that calls the given callbacks upon connection and disconnection from the DOM.
 */
export class WatchingElement extends window.HTMLElement {
  constructor (props) {
    super()
    this.onConnect = props.onConnect
    this.onDisconnect = props.onDisconnect
  }

  connectedCallback () {
    // Transfer own attributes to child to make this 'invisible'
    for (const attr of this.getAttributeNames()) {
      if (attr === 'class') {
        this.firstElementChild.classList.add(...this.className.split(' '))
      } else {
        this.firstElementChild.setAttribute(attr, this.getAttribute(attr))
      }
    }

    if (this.onConnect) {
      this.onConnect()
    }
  }

  disconnectedCallback () {
    if (this.onDisconnect) {
      this.onDisconnect()
    }
  }
}
