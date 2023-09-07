import { TextWidget } from '../free_form_content/text.mjs'
import { LocalImage } from '../free_form_content/local_image.mjs'
import { RemoteImage } from '../free_form_content/remote_image.mjs'
import { Link } from '../free_form_content/link.mjs'
import { QrcodeContent } from '../free_form_content/qrcode_content.mjs'
import { UnknownWidgetTypeError } from '../../util.mjs'
import { WithClasses } from '../with_classes.mjs'
import { Caption } from '../caption.mjs'
import { Clock } from '../clock.js'
import { Department } from '../department/department.mjs'
import { ContentStream } from '../free_form_content/content_stream.mjs'
import { Person } from '../department/person.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Container } from '../containers/container.mjs'

/**
 * Deserialize the given {@link DeserializableWidget} from the given JSON representation.
 *
 * @throws UnknownWidgetTypeError if the given object is not a piece of {@link FreeFormContent}
 * @param {object} obj the object to try to deserialize
 * @returns {DeserializableWidget}
 */
export function deserializeWidget (obj) {
  switch (obj.type) {
    case 'text':
      return TextWidget.fromJSON(obj)
    case 'local_image':
      return LocalImage.fromJSON(obj)
    case 'remote_image':
      return RemoteImage.fromJSON(obj)
    case 'link':
      return Link.fromJSON(obj)
    case 'qrcode_content':
      return QrcodeContent.fromJSON(obj)
    case 'container':
      return Container.fromJSON(obj)
    case 'with_classes':
      return WithClasses.fromJSON(obj)
    case 'content_and_caption':
      return ContentAndCaption.fromJSON(obj)
    case 'caption':
      return Caption.fromJSON(obj)
    case 'clock':
      return Clock.fromJSON(obj)
    case 'department':
      return Department.fromJSON(obj)
    case 'person':
      return Person.fromJSON(obj)
    case 'content_stream':
      return ContentStream.fromJson(obj)
    default:
      throw new UnknownWidgetTypeError(obj.type)
  }
}
