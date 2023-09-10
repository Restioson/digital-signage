import assert from 'assert'
import { JSDOM } from 'jsdom'
import { deserializeFreeFormContent } from '../static/widgets/free_form_content/free_form_content_factory.mjs'

describe('Widget', function () {
  beforeEach(() => {
    const dom = new JSDOM(
      `<html lang="en">
       <body>
       </body>
     </html>`,
      { url: 'http://localhost' }
    )

    global.window = dom.window
    global.document = dom.window.document
  })

  describe('FreeFormContent', function () {
    describe('TextWidget', function () {
      it('renders', function () {
        const title = 't'
        const body = 'b'
        checkRenderedText(
          deserializeFreeFormContent({ type: 'text', title, body }).render(),
          title,
          body
        )
      })
    })

    describe('LocalImage', function () {
      it('render', function () {
        const id = 1
        checkRenderedLocalImage(
          deserializeFreeFormContent({ type: 'local_image', id }).render(),
          id
        )
      })
    })

    describe('RemoteImage', function () {
      it('render', function () {
        const url = 'https://example.com/'
        checkRenderedRemoteImage(
          deserializeFreeFormContent({
            type: 'remote_image',
            src: url
          }).render(),
          url
        )
      })
    })

    describe('Link', function () {
      it('render', function () {
        const url = 'https://example.com/'
        const out = deserializeFreeFormContent({ type: 'link', url }).render()
        checkRenderedLink(out, url)
        assert(out.children[1].children[1].hidden)
      })

      it('render with caption (title & body)', function () {
        const url = 'https://example.com/'
        const title = 'Hello'
        const body = 'there'
        checkRenderedLinkCaptionedTitleBody(
          deserializeFreeFormContent({
            type: 'link',
            url,
            caption: { title, body }
          }).render(),
          url,
          title,
          body
        )
      })

      it('render with caption (body only)', function () {
        const url = 'https://example.com/'
        const body = 'body of caption'
        checkRenderedLinkCaptionedBody(
          deserializeFreeFormContent({
            type: 'link',
            url,
            caption: { body }
          }).render(),
          url,
          body
        )
      })
    })

    describe('Qrcode', function () {
      it('render', function () {
        const url = 'https://example.com/'
        const out = deserializeFreeFormContent({
          type: 'qrcode_content',
          url
        }).render()
        checkRenderedQrcode(out, url)
        assert(out.children[1].hidden)
      })

      it('render with caption (title & body)', function () {
        const url = 'https://example.com/'
        const title = 'Hello'
        const body = 'there'
        checkRenderedQrcodeCaptionedTitleBody(
          deserializeFreeFormContent({
            type: 'qrcode_content',
            url,
            caption: { title, body }
          }).render(),
          url,
          title,
          body
        )
      })

      it('render with caption (body only)', function () {
        const url = 'https://example.com/'
        const body = 'body of caption'
        checkRenderedQrcodeCaptionedBody(
          deserializeFreeFormContent({
            type: 'qrcode_content',
            url,
            caption: { body }
          }).render(),
          url,
          body
        )
      })
    })
  })
})

export function checkRenderedText (out, expectedTitle, expectedBody) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 2)

  const title = out.children[0]
  assert.equal(title.tagName, 'H3')
  assert.equal(title.innerText, expectedTitle)

  const body = out.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.innerText, expectedBody)

  return out
}

export function checkRenderedLocalImage (out, expectedId) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 2)

  const img = out.children[0]
  assert.equal(img.tagName, 'IMG')
  assert(img.src.endsWith(`/api/content/${expectedId}/blob`))

  assert(out.children[1].hidden, 'caption should be hidden')
}

export function checkRenderedRemoteImage (out, expectedSrc) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 2)

  const img = out.children[0]
  assert.equal(img.tagName, 'IMG')
  assert.equal(img.src, expectedSrc)

  assert(out.children[1].hidden, 'caption should be hidden')
}

export function checkRenderedLink (out, expectedUrl) {
  assert.equal(out.tagName, 'DIV')
  const a = out.children[0]
  assert.equal(a.tagName, 'IFRAME')
  assert.equal(a.src, expectedUrl)
  const b = out.children[1]
  assert.equal(b.tagName, 'DIV')
  const c = b.children[0]
  assert.equal(c.tagName, 'A')
}

export function checkRenderedLinkCaptionedTitleBody (
  out,
  expectedUrl,
  expectedTitle,
  expectedBody
) {
  checkRenderedLink(out, expectedUrl)
  const caption = out.children[1].children[1]
  assert.equal(caption.tagName, 'DIV')
  assert.equal(caption.className, 'content-caption')
  assert.equal(caption.children.length, 2)

  const title = caption.children[0]
  assert.equal(title.tagName, 'P')
  assert.equal(title.className, 'caption-title')
  assert.equal(title.innerText, expectedTitle)

  const body = caption.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerText, expectedBody)
}

export function checkRenderedLinkCaptionedBody (
  out,
  expectedUrl,
  expectedBody
) {
  checkRenderedLink(out, expectedUrl)
  const caption = out.children[1].children[1]
  assert.equal(caption.tagName, 'DIV')
  assert.equal(caption.className, 'content-caption')
  assert.equal(caption.children.length, 2)

  assert(caption.children[0].hidden, 'caption title should be hidden')

  const body = caption.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerText, expectedBody)

  return out
}

export function checkRenderedQrcode (out, expectedUrl) {
  assert.equal(out.tagName, 'DIV')
  const a = out.children[0]
  assert.equal(a.tagName, 'A')
  const aa = a.children[0]
  assert.equal(aa.tagName, 'CANVAS')
  assert(!aa.classList.contains('error'))
}

export function checkRenderedQrcodeCaptionedTitleBody (
  out,
  expectedUrl,
  expectedTitle,
  expectedBody
) {
  checkRenderedQrcode(out, expectedUrl)
  assert.equal(out.children.length, 2)
  const caption = out.children[1]
  assert.equal(caption.tagName, 'DIV')
  assert.equal(caption.className, 'content-caption')
  assert.equal(caption.children.length, 2)

  const title = caption.children[0]
  assert.equal(title.tagName, 'P')
  assert.equal(title.className, 'caption-title')
  assert.equal(title.innerText, expectedTitle)

  const body = caption.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerText, expectedBody)
}

export function checkRenderedQrcodeCaptionedBody (
  out,
  expectedUrl,
  expectedBody
) {
  checkRenderedQrcode(out, expectedUrl)
  assert.equal(out.children.length, 2)
  const caption = out.children[1]
  assert.equal(caption.tagName, 'DIV')
  assert.equal(caption.className, 'content-caption')
  assert.equal(caption.children.length, 2)

  assert(caption.children[0].hidden, 'caption title should be hidden')

  const body = caption.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerText, expectedBody)

  return out
}
