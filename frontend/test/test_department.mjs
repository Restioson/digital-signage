import { JSDOM } from 'jsdom'
import { Person } from '../static/widgets/department/person.mjs'
import assert from 'assert'

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

  describe('Person', function () {
    it('renders', function () {
      const expectedProps = {
        email: 'myemail@example.com',
        name: 'John Doe',
        officeHours: '10am-9pm on Wednesdays',
        officeLocation: 'CS302',
        phone: '021 111 1111',
        position: 'Professor',
        title: 'Prof'
      }

      const out = new Person(expectedProps).render()
      checkRenderedPerson(out, expectedProps)
    })
  })
})

export function checkRenderedPerson (out, expected) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 2)

  const title = out.children[0]
  assert.equal(title.tagName, 'H3')
  assert.equal(title.innerText, `${expected.title} ${expected.name}`)

  const body = out.children[1]
  const split = body.innerText.split('\n')
  assert.equal(split[0], `Position: ${expected.position}`)
  assert.equal(split[1], `Office Hours: ${expected.officeHours}`)
  assert.equal(split[2], `Office Location: ${expected.officeLocation}`)
  assert.equal(split[3], `Email: ${expected.email}`)
  assert.equal(split[4], `Phone: ${expected.phone}`)
}
