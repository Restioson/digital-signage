export class XMLTag {
  constructor ({ type, children, attributes }) {
    this.type = type
    this._children = children || []
    this.attributes = attributes || []
  }

  /**
   * Get the attribute with the given name and return its data.
   *
   * @param attribute
   * @return {*}
   */
  attribute (attribute) {
    return this.attributes[attribute]
  }

  /**
   * Get an attribute with the given name which is represented as a child tag and return its data.
   *
   * @param attribute
   * @return {*}
   */
  childAttribute (attribute) {
    const child = this.namedChild(attribute)
    return child ? child._children : undefined
  }

  /**
   * Returns the text inside this element.
   */
  text () {
    return this._children.find(child => child['#text'])['#text']
  }

  /**
   * Takes a child of this tag of the given type.
   *
   * Example XML:
   * ```
   * <my_parent>
   *   <named_child>
   *     <child_of_child/>
   *   </named_child>
   * </my_parent>
   * ```
   *
   * This method would return the tag representing `named_child`, _not_ `child_of_child`.
   */
  typedChild (type) {
    return this.children().find(child => child.type === type)
  }

  /**
   * Return a named child of this tag.
   *
   * Example XML:
   * ```
   * <my_parent>
   *   <named_child>
   *     <some_tag>
   *       <some_tag_child>
   *     </some_tag>
   *   </named_child>
   * </my_parent>
   * ```
   *
   * This method would return the tag representing `some_tag`.
   *
   * @param name the name of the child
   * @return {XMLTag}
   */
  namedChild (name) {
    const wrappedChild = this.children().find(child => child.type === name)
    return wrappedChild ? wrappedChild.firstChild() : undefined
  }

  /**
   * Return the first child of this tag.
   *
   * @public
   * @return XMLTag the child of this tag
   */
  firstChild () {
    return this._nthChild(0)
  }

  /**
   * Take the child at the given index.
   *
   * @param idx
   * @private
   */
  _nthChild (idx) {
    const data = this._children[idx]
    const type = Object.getOwnPropertyNames(data)[0]
    return new XMLTag({
      type,
      children: data[type],
      attributes: data[':@']
    })
  }

  /**
   * Take the children of this tag.
   *
   * @public
   * @return XMLTag[] the children of this tag
   */
  children () {
    return Array.from(this._children.keys())
      .map(idx => this._nthChild(idx))
      .filter(tag => tag.type !== '#text')
  }
}
