'use strict'

/*
 * adonis-mq
 *
 * (c) Luci <lucnn@luci.vn>
 *
*/

class Resetable {
  constructor (defaultValue) {
    this._defaultValue = defaultValue
    this.set(defaultValue)
  }

  set (val) {
    this._val = val
  }

  get () {
    return this._val
  }

  clear () {
    this.set(this._defaultValue)
  }

  pull () {
    return ((val) => {
      this.clear()
      return val
    })(this.get())
  }
}

module.exports = Resetable
