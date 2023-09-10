import { importFromNpm, UnknownWidgetTypeError } from '../../util.mjs'
import { Caption } from '../caption.mjs'
import { Clock } from '../clock.js'
import { Department } from '../department/department.mjs'
import { ContentStream } from '../free_form_content/content_stream.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Container } from '../containers/container.mjs'
import { WithHTMLAttrs } from './with_html_attrs.mjs'
import { XMLTag } from './xml_tag.mjs'
const { XMLParser } = await importFromNpm('fast-xml-parser')

/**
 * Deserialize the given {@link DeserializableWidget} from the given XML layout text.
 * @param {string} xml
 * @returns {Widget}
 */
export function deserializeWidgetFromXML (xml) {
  const options = {
    ignoreDeclaration: true,
    attributeNamePrefix: '',
    ignorePiTags: true,
    ignoreAttributes: false,
    preserveOrder: true,
    allowBooleanAttributes: true,
    parseAttributeValue: true,
    processEntities: false,
    stopNodes: ['*.html'],
    unpairedTags: ['clock', 'department', 'stream']
  }

  const parser = new XMLParser(options)
  return deserializeWidgetFromTag(
    new XMLTag({ children: parser.parse(xml) }).firstChild()
  )
}

/**
 * Deserialize the given {@link DeserializableWidget} from the given XML layout representation.
 *
 * @throws UnknownWidgetTypeError if the given object is a known deserializable type
 * @param {XMLTag} tag the XML tag to try to deserialize
 * @returns {Widget}
 */
export function deserializeWidgetFromTag (tag) {
  const widget = deserializeWidgetRaw(tag)
  const htmlAttrs = Object.getOwnPropertyNames(tag.attributes).filter(attr =>
    attr.startsWith('html:')
  )
  if (htmlAttrs.length > 0) {
    return new WithHTMLAttrs({
      attributes: Object.fromEntries(
        htmlAttrs.map(attr => [attr.substring(5), tag.attribute(attr)])
      ),
      child: widget
    })
  } else {
    return widget
  }
}

/**
 * Deserialize the given widget without processing its `html:` attributes
 *
 * @param tag
 * @return {DeserializableWidget}
 */
function deserializeWidgetRaw (tag) {
  switch (tag.type) {
    case 'container':
      return Container.fromXML(tag)
    case 'content_and_caption':
      return ContentAndCaption.fromXML(tag)
    case 'caption':
      return Caption.fromXML(tag)
    case 'clock':
      return Clock.fromXML(tag)
    case 'department':
      return Department.fromXML(tag)
    case 'content_stream':
      return ContentStream.fromXML(tag)
    default:
      throw new UnknownWidgetTypeError(tag.type)
  }
}
