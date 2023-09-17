import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Widget } from '../widget.mjs'
import { deserializeWidgetFromTag } from '../deserializable/widget_deserialization_factory.mjs'
import { Root } from '../root.mjs'

/**
 * A page is a widget which renders the children in their own shadow dom to encapsulate inline styles and so on,
 * if `shadowDom` is true (which is the default). Otherwise, it renders them in a div.
 *
 * It does, however, add display.css.
 */
export class Page extends DeserializableWidget {
  constructor ({ children, shadowDom = true }) {
    super()
    this.children = children
    this.shadowDom = shadowDom
  }

  build () {
    const div = document.createElement('div')

    const rendered = this.children.map(child => Widget.renderIfWidget(child))

    if (this.shadowDom) {
      const shadow = div.attachShadow({ mode: 'open' })

      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.href = '/static/display.css'
      shadow.append(style)

      shadow.append(...rendered)

      Root.getInstance().observeRoot(shadow)
    } else {
      div.append(...rendered)
    }

    Root.getInstance().watchElement({
      element: div,
      onAdd: () =>
        console.assert(
          !(div.getRootNode() instanceof window.ShadowRoot),
          'Do not nest Pages! WithRefresh widgets will break'
        )
    })

    return div
  }

  className () {
    return 'page'
  }

  static fromXML (tag) {
    const raw = tag.attribute('shadow-dom')
    const shadowDom = raw != null ? raw : 'true'
    return new Page({
      children: tag.children().map(deserializeWidgetFromTag),
      shadowDom: shadowDom === 'true'
    })
  }
}
