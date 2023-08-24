import { JSDOM } from 'jsdom'
import { WithClasses } from '../static/widgets/with_classes.mjs'
import assert from 'assert'
import { Caption } from '../static/widgets/caption.mjs'
import { Container } from '../static/widgets/containers/container.mjs'
import { Visibility } from '../static/widgets/visibility.mjs'
import { ContentAndCaption } from '../static/widgets/containers/content_and_caption.mjs'
import { WithRefresh } from '../static/widgets/dynamic/with_refresh.mjs'
import { Widget } from '../static/widgets/widget.mjs'
import { CachingContainer } from '../static/widgets/dynamic/caching_container.mjs'

describe('Widget', function () {
  beforeEach(() => {
    const dom = new JSDOM(
      `<html>
         <body>
         </body>
       </html>`,
      { url: 'http://localhost' }
    )

    global.window = dom.window
    global.document = dom.window.document
  })

  describe('WithClasses', function () {
    const classList = ['test-class-1', 'test-class-2']

    it('adds classes', function () {
      const widget = new WithClasses({
        child: document.createElement('p'),
        classList
      })

      assert.deepStrictEqual(Array.from(widget.render().classList), classList)
    })

    it('does not remove existing classes', function () {
      const preexisting = 'pre-existing-class'
      const child = document.createElement('p')
      child.className = preexisting

      const widget = new WithClasses({ child, classList })

      assert.deepStrictEqual(
        Array.from(widget.render().classList),
        [preexisting].concat(classList)
      )
    })

    it('works with widget children', function () {
      const child = new Caption({ title: 'Title', body: 'Body' })
      const widget = new WithClasses({ child, classList })

      const expected = child.render()
      expected.classList.add(...classList)

      assert.deepStrictEqual(widget.render(), expected)
      assert.deepStrictEqual(
        Array.from(widget.render().classList),
        ['content-caption'].concat(classList)
      )
    })

    it('does not allow WithRefresh as child', function () {
      assert.throws(
        () => new WithClasses({ child: new WithRefresh({}) }),
        Error
      )
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
  })

  describe('Caption', function () {
    it('renders with title and body', function () {
      const widget = new Caption({ title: 'Title', body: 'Body' })
      const rendered = widget.render()
      assert.equal(rendered.children.length, 2)
      assert.equal(rendered.className, 'content-caption')
      assert.equal(rendered.children[0].tagName, 'P')
      assert.equal(rendered.children[0].className, 'caption-title')
      assert.equal(rendered.children[0].innerText, 'Title')
      assert.equal(rendered.children[1].tagName, 'P')
      assert.equal(rendered.children[1].className, 'caption-body')
      assert.equal(rendered.children[1].innerText, 'Body')
    })

    it('renders without title', function () {
      const widget = new Caption({ body: 'Body' })
      const rendered = widget.render()
      assert.equal(rendered.children.length, 2)
      assert.equal(rendered.className, 'content-caption')
      assert.equal(rendered.children[0].hidden, true)
      assert.equal(rendered.children[1].tagName, 'P')
      assert.equal(rendered.children[1].className, 'caption-body')
      assert.equal(rendered.children[1].innerText, 'Body')
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

      const widget = new ContentAndCaption({ content, caption })
      const rendered = widget.render()
      assert.deepStrictEqual(rendered.children.length, 2)
      assert.deepStrictEqual(rendered.children[0], content)
      assert.deepStrictEqual(rendered.children[1], caption.render())
    })

    it('renders with null caption', function () {
      const content = document.createElement('p')
      content.innerText = 'test'
      const widget = new ContentAndCaption({ content, caption: null })
      const rendered = widget.render()
      assert.deepStrictEqual(rendered.children.length, 2)
      assert.deepStrictEqual(rendered.children[0], content)
      assert(rendered.children[1].hidden)
    })
  })

  describe('CachingContainer', function () {
    class TrackerWidget extends Widget {
      constructor ({ id }) {
        super()
        this.id = id
        this.builds = 0
      }

      build () {
        this.builds++
        const div = document.createElement('div')
        div.innerText = this.id
        return div
      }
    }

    function checkRender (out, ids) {
      assert.equal(out.tagName, 'DIV')
      assert.equal(out.children.length, ids.length)

      for (let i = 0; i < out.children.length; i++) {
        assert.equal(out.children[i].innerText, ids[i])
      }
    }

    it('should not rebuild children when unchanged', function () {
      const container = new CachingContainer({ getId: widget => widget.id })
      container.children = [
        new TrackerWidget({ id: 1 }),
        new TrackerWidget({ id: 2 })
      ]

      let out = container.render()
      checkRender(out, [1, 2])
      assert.strictEqual(container.children[0].builds, 1)
      assert.strictEqual(container.children[1].builds, 1)

      out = container.render()
      checkRender(out, [1, 2])
      assert.strictEqual(container.children[0].builds, 1)
      assert.strictEqual(container.children[1].builds, 1)
    })

    it('should rebuild when changed', function () {
      const container = new CachingContainer({ getId: widget => widget.id })
      container.children = [
        new TrackerWidget({ id: 1 }),
        new TrackerWidget({ id: 2 })
      ]

      let out = container.render()
      checkRender(out, [1, 2])
      assert.strictEqual(container.children[0].builds, 1)
      assert.strictEqual(container.children[1].builds, 1)

      container.children.splice(1, 0, new TrackerWidget({ id: 3 }))
      container.children[0].id = 4
      out = container.render()
      checkRender(out, [4, 3, 2])
      assert.strictEqual(container.children[0].builds, 2)
      assert.strictEqual(container.children[1].builds, 1)
      assert.strictEqual(container.children[2].builds, 1)
    })
  })
})
