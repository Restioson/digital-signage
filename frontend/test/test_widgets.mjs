import assert from 'assert'
import { Caption } from '../static/widgets/caption.mjs'
import { Container } from '../static/widgets/containers/container.mjs'
import { Visibility } from '../static/widgets/visibility.mjs'
import { ContentAndCaption } from '../static/widgets/containers/content_and_caption.mjs'
import { deserializeWidgetFromXML } from '../static/widgets/deserializable/widget_deserialization_factory.mjs'
import { Clock } from '../static/widgets/clock.js'
import { main } from '../static/display.mjs'
import {
  Root,
  testExports as rootTestExports,
  testExports
} from '../static/widgets/root.mjs'
import { WithHTMLAttrs } from '../static/widgets/deserializable/with_html_attrs.mjs'
import { HtmlWidget } from '../static/widgets/html.mjs'

describe('Widget', function () {
  describe('DeserializableWidget', function () {
    afterEach(function () {
      document.getElementById('root').replaceChildren()
      testExports.destroyRoot()
    })

    it('loads entire layout and renders', function () {
      main({
        department: 1,
        layout:
          "<container><clock> <department> <content-stream><stream id='1'></content-stream></container>"
      })
      const root = document.getElementById('root')
      assert.equal(root.children.length, 1)

      const container = root.children[0]
      assert.equal(container.tagName, 'DIV')
      assert.equal(container.children.length, 3)

      assert.equal(container.children[0].tagName, 'DIV')
      assert(classListSubsetOf(container.children[0].classList, ['clock']))

      assert.equal(container.children[1].tagName, 'DIV')
      assert(
        classListSubsetOf(container.children[1].classList, [
          'container',
          'department'
        ])
      )

      assert.equal(container.children[2].tagName, 'DIV')
      assert(
        classListSubsetOf(container.children[2].classList, [
          'container',
          'content-stream'
        ])
      )
    })
  })

  describe('WithHTMLAttrs', function () {
    const classList = ['test-class-1', 'test-class-2']
    const attributes = { class: 'test-class-1 test-class-2' }

    it('adds classes', function () {
      const widget = new WithHTMLAttrs({
        child: document.createElement('p'),
        attributes
      })

      assert.deepStrictEqual(Array.from(widget.render().classList), classList)
    })

    it('does not remove existing classes', function () {
      const preexisting = 'pre-existing-class'
      const child = document.createElement('p')
      child.className = preexisting

      const widget = new WithHTMLAttrs({ child, attributes })

      assert.deepStrictEqual(
        Array.from(widget.render().classList),
        [preexisting].concat(classList)
      )
    })

    it('works with widget children', function () {
      const child = new Caption({ title: 'Title', body: 'Body' })
      const widget = new WithHTMLAttrs({ child, attributes })

      const expected = child.render()
      expected.classList.add(...classList)

      assert.deepStrictEqual(widget.render(), expected)
      assert.deepStrictEqual(
        Array.from(widget.render().classList),
        ['container', 'caption'].concat(classList)
      )
    })

    it('deserializes', function () {
      const xml = `
        <clock html:id="1" html:class="someClass1 someClass2" format="h:mm:ss">
      `

      const widget = deserializeWidgetFromXML(xml)
      assert(widget instanceof WithHTMLAttrs)
      assert.equal(widget.attributes.id, '1')
      assert.equal(widget.attributes.class, 'someClass1 someClass2')

      assert(widget.child instanceof Clock)
      assert.equal(widget.child.format, 'h:mm:ss')
    })
  })

  describe('Container', function () {
    it('renders into a div with children', function () {
      const children = [
        document.createElement('p'),
        document.createElement('a')
      ]
      const widget = new Container({ children })
      assert.equal(widget.render().tagName, 'DIV')
      assert.deepStrictEqual(Array.from(widget.render().children), children)
    })

    it('works with widget children', function () {
      const children = [
        new Caption({ title: 'Title1', body: 'Body1' }),
        new Caption({ title: 'Title2', body: 'Body2' })
      ]

      const widget = new Container({ children })
      assert.deepStrictEqual(
        Array.from(widget.render().children),
        children.map(child => child.render())
      )
    })

    it('deserializes', function () {
      const xml =
        '<container><clock format="h:mm:ss"/> <clock format="h:mm:ss a"/></container>'

      const widget = deserializeWidgetFromXML(xml)
      assert(widget instanceof Container)
      assert(widget.children[0] instanceof Clock)
      assert.equal(widget.children[0].format, 'h:mm:ss')
      assert(widget.children[1] instanceof Clock)
      assert.equal(widget.children[1].format, 'h:mm:ss a')
    })
  })

  describe('Caption', function () {
    it('renders with title and body', function () {
      const widget = new Caption({ title: 'Title', body: 'Body' })
      const rendered = widget.render()
      assert.equal(rendered.children.length, 2)
      assert.equal(rendered.className, 'container caption')
      assert.equal(rendered.children[0].tagName, 'P')
      assert.equal(rendered.children[0].className, 'caption-title')
      assert.equal(rendered.children[0].innerHTML, 'Title')
      assert.equal(rendered.children[1].tagName, 'P')
      assert.equal(rendered.children[1].className, 'caption-body')
      assert.equal(rendered.children[1].innerHTML, 'Body')
    })

    it('renders without title', function () {
      const widget = new Caption({ body: 'Body' })
      const rendered = widget.render()
      assert.equal(rendered.children.length, 2)
      assert.equal(rendered.className, 'container caption')
      assert.equal(rendered.children[0].hidden, true)
      assert.equal(rendered.children[1].tagName, 'P')
      assert.equal(rendered.children[1].className, 'caption-body')
      assert.equal(rendered.children[1].innerHTML, 'Body')
    })

    it('deserializes', function () {
      const xml =
        '<caption><title>myTitle</title> <body>myBody</body></caption>'

      const widget = deserializeWidgetFromXML(xml)
      assert(widget instanceof Caption)
      assert.equal(widget.title, 'myTitle')
      assert.equal(widget.body, 'myBody')
    })
  })

  describe('Visibility', function () {
    it('renders when visible', function () {
      const child = document.createElement('p')
      child.innerText = 'test'
      const widget = new Visibility({ visible: true, child })
      assert.deepStrictEqual(widget.render(), child)
    })
  })

  describe('ContentAndCaption', function () {
    it('renders', function () {
      const caption = new Caption({ title: 'Title', body: 'Body' })
      const content = document.createElement('p')
      content.innerText = 'test'

      const captionRendered = caption.render()
      const widget = new ContentAndCaption({ content, caption })
      const rendered = widget.render()
      assert.deepStrictEqual(rendered.children.length, 3)
      assert.deepStrictEqual(rendered.children[0], captionRendered.children[0])
      assert.deepStrictEqual(rendered.children[1], content)
      assert.deepStrictEqual(rendered.children[2], captionRendered.children[1])
    })

    it('renders with null caption', function () {
      const content = document.createElement('p')
      content.innerText = 'test'
      const widget = new ContentAndCaption({ content, caption: null })
      const rendered = widget.render()
      assert.deepStrictEqual(rendered.children.length, 1)
      assert.deepStrictEqual(rendered.children[0], content)
    })

    it('deserializes', function () {
      const xml = `
        <content-and-caption>
            <caption>
                <title>myTitle</title>
                <body>myBody</body>
            </caption>
            <content>
                <clock format='h:mm:ss'>
            </content>
        </content-and-caption>
      `

      const widget = deserializeWidgetFromXML(xml)
      assert(widget instanceof ContentAndCaption)
      assert(widget.content instanceof Clock)
      assert.equal(widget.content.format, 'h:mm:ss')
      assert(widget.caption instanceof Caption)
      assert.equal(widget.caption.title, 'myTitle')
      assert.equal(widget.caption.body, 'myBody')
    })
  })

  describe('HtmlWidget', function () {
    beforeEach(function () {
      Root.create({
        child: new Container({ children: [] }),
        targetElement: document.getElementById('root'),
        departmentId: 1,
        displayContentStream: 1
      })
    })

    afterEach(async function () {
      rootTestExports.destroyRoot()
    })

    it('renders', function () {
      const element = document.createElement('p')
      element.textContent = 'h'
      assert.deepStrictEqual(new HtmlWidget({ element }).render(), element)
    })

    it('deserializes', function () {
      const deser = deserializeWidgetFromXML('<html><p>h</p></html>').render()
      assert.equal(deser.tagName, 'P')
      assert.equal(deser.textContent, 'h')

      const deserDiv = deserializeWidgetFromXML(
        '<html><p>Ah</p> Text <p>Eh</p></html>'
      ).render()
      assert.equal(deserDiv.tagName, 'DIV')
      assert.equal(deserDiv.children.length, 2)
      assert.equal(deserDiv.children[0].textContent, 'Ah')
      assert.equal(deserDiv.children[1].textContent, 'Eh')
      assert.equal(deserDiv.textContent, 'Ah Text Eh')
    })
  })
})

function classListSubsetOf (list, expected) {
  return Array.from(expected).every(it => list.contains(it))
}
