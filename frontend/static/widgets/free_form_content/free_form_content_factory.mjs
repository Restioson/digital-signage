import { TextWidget } from './text.mjs'
import { LocalImage } from './local_image.mjs'
import { RemoteImage } from './remote_image.mjs'
import { Link } from './link.mjs'
import { Iframe } from './iframe.mjs'
import { QrcodeContent } from './qrcode_content.mjs'
import { UnknownWidgetTypeError } from '../../util.mjs'

/**
 * Deserialize the given {@link FreeFormContent} from its JSON API representation.
 *
 * @throws UnknownWidgetTypeError if the given object is not a known FreeFormContent type
 * @param {object} obj the object to try to deserialize
 * @returns {FreeFormContent}
 */
export function deserializeFreeFormContent (obj) {
  switch (obj.type) {
    case 'text':
      return TextWidget.fromJSON(obj)
    case 'local_image':
      return LocalImage.fromJSON(obj)
    case 'remote_image':
      return RemoteImage.fromJSON(obj)
    case 'link':
      return Link.fromJSON(obj)
    case 'iframe_content':
      return Iframe.fromJSON(obj)
    case 'qrcode_content':
      return QrcodeContent.fromJSON(obj)
    default:
      throw new UnknownWidgetTypeError(obj.type)
  }
}
