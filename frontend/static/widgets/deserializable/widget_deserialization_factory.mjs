import { importFromNpm, UnknownWidgetTypeError } from '../../util.mjs'
import { Caption } from '../caption.mjs'
import { Clock } from '../clock.js'
import { Loadshedding } from '../loadshedding.mjs'
import { Department } from '../department/department.mjs'
import { ContentStream } from '../free_form_content/content_stream.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Container } from '../containers/container.mjs'
import { WithHTMLAttrs } from './with_html_attrs.mjs'
import { XMLTag } from './xml_tag.mjs'
import { HtmlWidget } from '../html.mjs'
import { StyleWidget } from '../style.mjs'
import { RotatingContainer } from '../containers/rotating/rotating_container.mjs'
import { StaticRefresh } from '../dynamic/static_refresh.mjs'
import { Page } from '../containers/page.mjs'
import { Dummy } from '../containers/dummy.mjs'
import { Video } from '../video.mjs'
import { YoutubeVideo } from '../youtube.mjs'
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
    allowBooleanAttributes: false,
    parseAttributeValue: true,
    processEntities: false,
    stopNodes: ['*.html', '*.style', '*.script'],
    unpairedTags: ['clock', 'department', 'stream', 'loadshedding', 'script']
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
  let widget
  try {
    widget = deserializeWidgetRaw(tag)
  } catch (e) {
    const attrs = Object.entries(tag.attributes).map(
      ([attr, val]) => `${attr}="${val}"`
    )
    throw new Error(
      `error deserializing <${[tag.type, ...attrs].join(' ')}>:\n${e.message}`
    )
  }

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
    case 'content-and-caption':
      return ContentAndCaption.fromXML(tag)
    case 'caption':
      return Caption.fromXML(tag)
    case 'clock':
      return Clock.fromXML(tag)
    case 'loadshedding':
      return Loadshedding.fromXML(tag)
    case 'department':
      return Department.fromXML(tag)
    case 'content-stream':
      return ContentStream.fromXML(tag)
    case 'style':
      return StyleWidget.fromXML(tag)
    case 'html':
      return HtmlWidget.fromXML(tag)
    case 'rotation':
      return RotatingContainer.fromXML(tag)
    case 'refresh':
      return StaticRefresh.fromXML(tag)
    case 'dummy':
      return Dummy.fromXML(tag)
    case 'video':
      return Video.fromXML(tag)
    case 'youtube':
      return YoutubeVideo.fromXML(tag)
    case 'template':
      return Page.fromXML(tag.typedChild('page'))
    default:
      throw new UnknownWidgetTypeError(tag.type)
  }
}
