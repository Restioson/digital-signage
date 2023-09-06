import { JSDOM } from 'jsdom'
import { Lecturer } from '../static/widgets/department/lecturer.mjs'
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

  describe('Lecturer', function () {
    it('renders', function () {
      const expectedProps = {
        department: 'testDept',
        email: 'myemail@example.com',
        name: 'John Doe',
        officeHours: '10am-9pm on Wednesdays',
        officeLocation: 'CS302',
        phone: '021 111 1111',
        position: 'Professor',
        title: 'Prof'
      }

      const out = new Lecturer(expectedProps).render()
      checkRenderedLecturer(out, expectedProps)
    })
  })
})

export function checkRenderedLecturer (out, expected) {
  assert.equal(out.tagName, 'DIV')
  assert.equal(out.children.length, 2)

  const title = out.children[0]
  assert.equal(title.tagName, 'H3')
  assert.equal(title.innerText, `${expected.title} ${expected.name}`)

  const body = out.children[1]
  const split = body.innerText.split('\n')
  assert.equal(split[0], `Department: ${expected.department}`)
  assert.equal(split[1], `Position: ${expected.position}`)
  assert.equal(split[2], `Office Hours: ${expected.officeHours}`)
  assert.equal(split[3], `Office Location: ${expected.officeLocation}`)
  assert.equal(split[4], `Email: ${expected.email}`)
  assert.equal(split[5], `Phone: ${expected.phone}`)
}
