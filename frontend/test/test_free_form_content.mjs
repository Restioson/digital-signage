import assert from 'assert'
import { deserializeFreeFormContent } from '../static/widgets/free_form_content/free_form_content_factory.mjs'

describe('Widget', function () {
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
        assert.equal(
          out.className,
          'container content-and-caption free-form-content link'
        )
        const iframe = out.children[0]
        assert.equal(iframe.tagName, 'IFRAME')
        assert.equal(iframe.src, url)

        const qr = out.children[1]
        assert.equal(qr.tagName, 'CANVAS')
        assert.equal(qr.className, 'qrcode')
        assert(out.children.length, 2)
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
        assert.equal(
          out.className,
          'container content-and-caption free-form-content qrcode-content'
        )
        const qr = out.children[0]
        assert.equal(qr.tagName, 'CANVAS')
        assert.equal(qr.className, 'qrcode')
        assert(out.children.length, 1)
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
  assert.equal(title.innerHTML, expectedTitle)

  const body = out.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.innerHTML, expectedBody)

  return out
}

export function checkRenderedLocalImage (out, expectedId) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 1)

  const img = out.children[0]
  assert.equal(img.tagName, 'IMG')
  assert(img.src.endsWith(`/api/content/${expectedId}/blob`))
}

export function checkRenderedRemoteImage (out, expectedSrc) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 1)

  const img = out.children[0]
  assert.equal(img.tagName, 'IMG')
  assert.equal(img.src, expectedSrc)
}

export function checkRenderedLinkCaptionedTitleBody (
  out,
  expectedUrl,
  expectedTitle,
  expectedBody
) {
  assert.equal(
    out.className,
    'container content-and-caption free-form-content link'
  )
  const title = out.children[0]
  assert.equal(title.tagName, 'P')
  assert.equal(title.className, 'caption-title')
  assert.equal(title.innerHTML, expectedTitle)

  const iframe = out.children[1]
  assert.equal(iframe.tagName, 'IFRAME')
  assert.equal(iframe.src, expectedUrl)

  const qr = out.children[2]
  assert.equal(qr.tagName, 'CANVAS')
  assert.equal(qr.className, 'qrcode')

  const body = out.children[3]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerHTML, expectedBody)
}

export function checkRenderedLinkCaptionedBody (
  out,
  expectedUrl,
  expectedBody
) {
  assert.equal(
    out.className,
    'container content-and-caption free-form-content link'
  )
  const iframe = out.children[0]
  assert.equal(iframe.tagName, 'IFRAME')
  assert.equal(iframe.src, expectedUrl)

  const qr = out.children[1]
  assert.equal(qr.tagName, 'CANVAS')
  assert.equal(qr.className, 'qrcode')

  const body = out.children[2]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerHTML, expectedBody)

  return out
}

export function checkRenderedQrcodeCaptionedTitleBody (
  out,
  expectedUrl,
  expectedTitle,
  expectedBody
) {
  assert.equal(
    out.className,
    'container content-and-caption free-form-content qrcode-content'
  )
  const title = out.children[0]
  assert.equal(title.tagName, 'P')
  assert.equal(title.className, 'caption-title')
  assert.equal(title.innerHTML, expectedTitle)

  const qr = out.children[1]
  assert.equal(qr.tagName, 'CANVAS')
  assert.equal(qr.className, 'qrcode')

  const body = out.children[2]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerHTML, expectedBody)
}

export function checkRenderedQrcodeCaptionedBody (
  out,
  expectedUrl,
  expectedBody
) {
  assert.equal(
    out.className,
    'container content-and-caption free-form-content qrcode-content'
  )
  const qr = out.children[0]
  assert.equal(qr.tagName, 'CANVAS')
  assert.equal(qr.className, 'qrcode')

  const body = out.children[1]
  assert.equal(body.tagName, 'P')
  assert.equal(body.className, 'caption-body')
  assert.equal(body.innerHTML, expectedBody)

  return out
}
