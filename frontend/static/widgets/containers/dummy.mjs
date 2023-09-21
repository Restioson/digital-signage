import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { deserializeWidgetFromTag } from '../deserializable/widget_deserialization_factory.mjs'

/**
 * A dummy widget just renders the child. Nothing else. It's used to give the `duration` attribute to `rotation`
 * children.
 */
export class Dummy extends DeserializableWidget {
  constructor ({ child }) {
    super()
    this.child = child
  }

  build () {
    return this.child
  }

  className () {
    return 'dummy'
  }

  static fromXML (tag) {
    return new Dummy({ child: deserializeWidgetFromTag(tag.firstChild()) })
  }
}
