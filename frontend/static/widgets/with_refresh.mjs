import { Widget } from './widget.mjs'
import { Root } from './root.mjs'

/**
 * The refresh callback. This should update the {@link Widget}'s state.
 * @callback refresh
 * @async
 */

/**
 * The build callback. This should return a {@link Widget} or {@link HTMLElement} using the {@link Widget}'s state.
 * @callback refresh
 * @return {HTMLElement | Widget}
 */

/**
 * A {@link Widget} which is refreshed at regular intervals. It is completely rebuilt and replaced in-place upon
 * refresh.
 *
 * @augments Widget
 */
export class WithRefresh extends Widget {
  /**
   * @param {refresh} refresh called every refresh period
   * @param period how often to call refresh
   * @param {builder} builder rebuild the visual representation of the widget
   */
  constructor ({ refresh, period, builder }) {
    super()
    this.refresh = refresh
    this.builder = builder
    this.period = period
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

    await this.refresh()
    const newElement = this.renderChild()
    element.replaceWith(newElement)

    setTimeout(async () => this.refreshForever(newElement), this.period)
  }

  /**
   * Render the widget's child using the builder method.
   *
   * @private
   * @returns {HTMLElement|*}
   */
  renderChild () {
    const built = this.builder()
    return built instanceof Widget ? built.render() : built
  }

  build () {
    const element = this.renderChild()
    Root.getInstance().addPostRenderCallback(() => this.refreshForever(element))
    return element
  }
}
