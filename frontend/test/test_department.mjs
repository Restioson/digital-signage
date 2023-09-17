import { Person } from '../static/widgets/department/person.mjs'
import assert from 'assert'

describe('Widget', function () {
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
  assert.equal(out.children.length, 7)

  const title = out.children[0]
  assert.equal(title.tagName, 'H3')
  assert.equal(title.innerText, `${expected.title} ${expected.name}`)

  const image = out.children[1]
  assert.equal(image.tagName, 'DIV')

  const text1 = out.children[2]
  assert.equal(text1.tagName, 'P')
  assert.equal(text1.innerText, `Position: ${expected.position}`)
  const text2 = out.children[3]
  assert.equal(text2.tagName, 'P')
  assert.equal(text2.innerText, `Office Hours: ${expected.officeHours}`)
  const text3 = out.children[4]
  assert.equal(text3.tagName, 'P')
  assert.equal(text3.innerText, `Office Location: ${expected.officeLocation}`)
  const text4 = out.children[5]
  assert.equal(text4.tagName, 'P')
  assert.equal(text4.innerText, `Email: ${expected.email}`)
  const text5 = out.children[6]
  assert.equal(text5.tagName, 'P')
  assert.equal(text5.innerText, `Phone: ${expected.phone}`)
}
