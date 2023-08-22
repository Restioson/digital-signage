import { TextWidget } from './text.mjs'
import { LocalImage } from './local_image.mjs'
import { RemoteImage } from './remote_image.mjs'
import { Link } from './link.mjs'
import { UnknownContentTypeError } from '../../util.mjs'

/**
 * Deserialize the given {@link FreeFormContent} from the given API representation.
 *
 * @throws UnknownContentTypeError if the given object is not a piece of {@link FreeFormContent}
 * @param {object} content the object to try to deserialize
 * @returns {FreeFormContent}
 */
export function deserializeFreeFormContent (content) {
  switch (content.type) {
    case 'text':
      return TextWidget.fromJSON(content)
    case 'local_image':
      return LocalImage.fromJSON(content)
    case 'remote_image':
      return RemoteImage.fromJSON(content)
    case 'link':
      return Link.fromJSON(content)
    default:
      throw UnknownContentTypeError(content.type)
  }
}
