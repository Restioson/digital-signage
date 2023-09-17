import { Widget } from '../widget.mjs'
import { WithHTMLAttrs } from '../deserializable/with_html_attrs.mjs'
import { Root } from '../root.mjs'

// HACK: nested with refreshes lose their sense of who their child is, so we track it using a class name
// This can then be efficiently queried with document.getElementByClassName, and it is also preserved
// by WithHTMLAttrs

/**
 * Class prefix for refresh ID
 *
 * @type {string}
 */
const classPrefix = 'with-refresh-id-'

/**
 * Gloabl counter for with refresh ID that always increases
 * @type {number}
 */
let withRefreshId = 0

/**
 * A {@link Widget} which is refreshed at regular intervals. It is completely rebuilt and replaced in-place upon
 * refresh.
 *
 * @see CachingContainer
 *
 * @augments Widget
 */
export class WithRefresh extends Widget {
  /**
   * @param {function(): Promise<boolean>} refresh called every refresh period and should update the state.
   * Returns true if child needs rebuild.
   * @param period how often to call refresh
   * @param {function(): (Widget|HTMLElement)} builder rebuild the visual representation of the widget
   */
  constructor ({ refresh, period, builder }) {
    super()
    this.refresh = refresh
    this.builder = builder
    this.period = period
    this.elementId = null
    this.root = null
  }

  /**
   * Refresh this widget and add another timeout to refresh this widget again once the period has elapsed.
   *
   * @private
   */
  async refreshForever () {
    if (!this.getElement()) {
      return
    }

    const dirty = await this.refresh()

    const element = this.getElement()
    if (!element) {
      return
    }

    let newElement = element
    if (dirty) {
      const attributes = {}

      for (const attr of element.getAttributeNames()) {
        attributes[attr] = element.getAttribute(attr)
      }

      newElement = this.renderChild(attributes)
      element.replaceWith(newElement)
    }

    setTimeout(() => this.refreshForever(), this.period)
  }

  getElement () {
    return this.root.querySelector(`.${classPrefix}${this.elementId}`)
  }

  /**
   * Render the widget's child using the builder method.
   *
   * @private
   * @returns {HTMLElement}
   */
  renderChild (oldAttributes) {
    // HACK: nested with refreshes lose their sense of who their child is, so we track it using a class name
    // This can then be efficiently queried with document.getElementByClassName, and it is also preserved
    // by WithHTMLAttrs
    const newClassList = [`${classPrefix}${this.elementId}`]
    for (const className of (oldAttributes.class || '').split(' ')) {
      if (className.startsWith(classPrefix)) {
        const id = parseInt(className.substring(classPrefix.length))

        // Do not put child WithRefresh ids in as they'll be rebuilt
        if (id < this.elementId) {
          newClassList.push(className)
        }
      } else if (className.length !== 0) {
        newClassList.push(className)
      }
    }

    return new WithHTMLAttrs({
      child: Widget.renderIfWidget(this.builder()),
      attributes: { ...oldAttributes, class: newClassList.join(' ') }
    }).render()
  }

  build () {
    this.elementId = withRefreshId++
    const child = this.renderChild({})
    Root.getInstance().watchElement({
      element: child,
      onAdd: () => {
        this.root = child.getRootNode()
        this.refreshForever()
      }
    })

    return child
  }

  className () {
    return null
  }
}
