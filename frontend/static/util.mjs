export class AbstractClassError extends Error {
  constructor (clazz, func) {
    super(`${clazz} is abstract, so ${func} must be overriden`)
    this.class = clazz
    this.func = func
  }
}

export class UnknownWidgetTypeError extends Error {
  constructor (name) {
    super(`unknown widget ${name}`)
    this.name = name
  }
}

export class RootAlreadyExistsError extends Error {
  constructor () {
    super('There may only be one Root widget, and it already exists')
  }
}

export class AssertionError extends Error {}

export async function importFromNpm (moduleName) {
  if (typeof global !== 'undefined' && typeof global.it === 'function') {
    return await import(moduleName)
  } else {
    return await import(`https://cdn.skypack.dev/${moduleName}`)
  }
}
