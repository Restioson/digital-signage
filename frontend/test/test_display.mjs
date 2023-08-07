import assert from 'assert'
import { sayHello } from '../static/display.mjs'

describe('sayHello()', function () {
  it('should return "Hello, JavaScript!"', function () {
    assert.equal(sayHello(), 'Hello, JavaScript!')
  })
})
