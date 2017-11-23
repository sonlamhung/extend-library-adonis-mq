'use strict'

/*
 * adonis-mq
 *
 * (c) Luci <lucnn@luci.vn>
 *
*/
const co = require('co')
const mixin = require('es6-class-mixin')
const _ = require('lodash')
const CE = require('../Exceptions')
const util = require('../../lib/util')
const Resetable = require('../../lib/Resetable')
const Response = require('../Response')
class Queue {

  constructor (conn, Request, Session, name, closure, nameClass) {
    this._conn = conn

    this._nameClass = nameClass

    /**
     * A reference to the closure, it will be executed after
     * all middleware method.
     *
     * @type {Function|Class}
     */
    this._closure = closure
    /**
     * A boolean to know whether closure is a class or not. When
     * closure is a class we call class methods for LifeCycle
     * events.
     *
     * @type {Boolean}
     */
    this._closureIsAClass = util.isClass(closure)
    /**
     * Adonis Request class to be initiated upon new socket
     * connection. It makes it easy to read info from the
     * request similar to the way we do it in controllers.
     *
     * @type {Class}
     */
    this.Request = Request
    this.Session = Session
    /**
     * Custom middleware to be executed for each socket
     * connection.
     *
     * @type {Array}
     */
    this._middleware = []

    /**
     * Lifecycle methods to be called as soon as
     * a channel is instantiated. Never change
     * the execution order of below methods
     */

    this._queue = this._conn.then(function (conn) {
      return conn.createChannel()
    })
    if(this._closureIsAClass == true){
      this._classFn = new this._closure(this._queue, this.Request, this.Session)
      this.startQueue(name)
    }else{
      this._closure.apply(undefined, [this._queue, this.Request])
    }
  }

  /**
   * Start queue receive message.
   */
  startQueue () {
    let args = _.toArray(arguments)
    let fn = args[0]
    let name_queue = this._nameClass+'.'+fn
    let classFn = this._classFn
    this._queue.then(function (ch) {
      ch.assertQueue(name_queue, {durable: true})
      ch.prefetch(1)
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", name_queue)
      ch.consume(name_queue, function (msg) {
        co(function * () {
          yield classFn[fn](ch,msg)
        })
      }, {noAck: false})
    })
  }
}

class ExtendedQueue extends mixin(
  Queue
) {}

module.exports = ExtendedQueue
