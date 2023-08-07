import assert from 'assert'
import { JSDOM } from 'jsdom'
import { renderFreeForm } from '../static/display.mjs'

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

describe('renderFreeForm()', function () {
  it('should render into a div with h3 and p in body', function () {
    const out = renderFreeForm({ title: 't', body: 'b' })
    assert.equal(out.tagName, 'DIV')
    assert.equal(out.children.length, 2)

    const title = out.children[0]
    assert.equal(title.tagName, 'H3')
    assert.equal(title.innerText, 't')

    const body = out.children[1]
    assert.equal(body.tagName, 'P')
    assert.equal(body.innerText, 'b')
  })
})
