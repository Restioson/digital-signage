import assert from 'assert'
import { JSDOM } from 'jsdom'
import { deserializeFreeFormContent } from '../static/widgets/free_form_content/free_form_content_factory.mjs'

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

describe('FreeFormContent', function () {
  it('Text should render into a div with h3 and p in body', function () {
    const out = deserializeFreeFormContent({
      id: 1,
      type: 'text',
      title: 't',
      body: 'b'
    }).render()
    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 2)

    const title = out.children[0]
    assert.equal(title.tagName, 'H3')
    assert.equal(title.innerText, 't')

    const body = out.children[1]
    assert.equal(body.tagName, 'P')
    assert.equal(body.innerText, 'b')
  })

  it('LocalImage should render into a div with img in body', function () {
    const out = deserializeFreeFormContent({
      id: 1,
      type: 'local_image'
    }).render()
    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 1)

    const img = out.children[0]
    assert.equal(img.tagName, 'IMG')
    assert(img.src.endsWith('/api/content/1/blob'))
  })

  it('RemoteImage should render into a div with img in body', function () {
    const out = deserializeFreeFormContent({
      id: 1,
      type: 'remote_image',
      src: 'exampleurl'
    }).render()
    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 1)

    const img = out.children[0]
    assert.equal(img.tagName, 'IMG')
    assert(img.src.endsWith('exampleurl'))
  })

  it('Link should render into a div with a in body', function () {
    const out = deserializeFreeFormContent({
      id: 1,
      type: 'link',
      url: 'https://example.com/'
    }).render()
    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 1)

    const a = out.children[0]
    assert.equal(a.tagName, 'A')
    assert.equal(a.href, 'https://example.com/')
    assert.equal(a.innerText, 'https://example.com/')
  })

  it('Link with caption (title and body) should be rendered', function () {
    const out = deserializeFreeFormContent({
      id: 1,
      type: 'link',
      url: 'https://example.com/',
      caption: { title: 'Hello', body: 'there' }
    }).render()
    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 2)

    const a = out.children[0]
    assert.equal(a.tagName, 'A')

    const caption = out.children[1]
    assert.equal(caption.tagName, 'DIV')
    assert.equal(caption.className, 'content-caption')
    assert.equal(caption.children.length, 2)

    const title = caption.children[0]
    assert.equal(title.tagName, 'P')
    assert.equal(title.className, 'caption-title')
    assert.equal(title.innerText, 'Hello')

    const body = caption.children[1]
    assert.equal(body.tagName, 'P')
    assert.equal(body.className, 'caption-body')
    assert.equal(body.innerText, 'there')
  })

  it('Link with caption (with just body) should be rendered', function () {
    const out = deserializeFreeFormContent({
      id: 1,
      type: 'link',
      url: 'https://example.com/',
      caption: { body: 'there' }
    }).render()

    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 2)

    const a = out.children[0]
    assert.equal(a.tagName, 'A')

    const caption = out.children[1]
    assert.equal(caption.tagName, 'DIV')
    assert.equal(caption.className, 'content-caption')
    assert.equal(caption.children.length, 1)

    const body = caption.children[0]
    assert.equal(body.tagName, 'P')
    assert.equal(body.className, 'caption-body')
    assert.equal(body.innerText, 'there')
  })
})
