export class AbstractClassError extends Error {
  constructor (clazz, func) {
    super(`${clazz} is abstract, so ${func} must be overriden`)
    this.class = clazz
    this.func = func
  }
}

export class UnknownContentTypeError extends Error {
  constructor (name) {
    super(`unknown content type ${name}`)
    this.anme = name
  }
}
