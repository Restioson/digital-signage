import { Widget } from '../widget.mjs'
import { WithHTMLAttrs } from '../deserializable/with_html_attrs.mjs'
import { Root } from '../root.mjs'

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
    this.observer = null
  }

  /**
   * Refresh this widget and add another timeout to refresh this widget again once the period has elapsed.
   *
   * @private
   * @param {HTMLElement} element
   */
  async refreshForever (element) {
    if (!element.isConnected) {
      return // Widget no longer exists in DOM; stop refreshing
    }

    const dirty = await this.refresh()

    let newElement = element
    if (dirty) {
      const attributes = {}

      for (const attr of element.getAttributeNames()) {
        attributes[attr] = element.getAttribute(attr)
      }

      newElement = this.renderChild(attributes)
      element.replaceWith(newElement)
    }

    setTimeout(() => this.refreshForever(newElement), this.period)
  }

  /**
   * Render the widget's child using the builder method.
   *
   * @private
   * @returns {HTMLElement}
   */
  renderChild (oldAttributes) {
    return new WithHTMLAttrs({
      child: Widget.renderIfWidget(this.builder()),
      attributes: oldAttributes
    }).render()
  }

  build () {
    const child = this.renderChild({})
    Root.getInstance().watchElement({
      element: child,
      onAdd: () => {
        this.refreshForever(child)
      }
    })

    return child
  }

  className () {
    return null
  }
}
