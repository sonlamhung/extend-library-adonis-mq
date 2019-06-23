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

  constructor (conn, Request, Session, name, closure, nameClass, noAck, exchange, exchange_type) {
    this._conn = conn
    this._nameClass = nameClass
    this._noAck = noAck
    this._exchange = exchange
    this._exchange_type = exchange_type

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
      if(typeof this._classFn[name] !== 'function'){ throw new Error('Khong ton tai action') }
      this.startQueue(name, this._noAck)
    }else{
      throw new Error('Khong ton tai action')
    }
  }

  /**
   * Start queue receive message.
   */
  startQueue () {
    let args = _.toArray(arguments)
    let fn = args[0]
    let noAck = args[1]
    let name_queue = this._nameClass+'.'+fn
    let classFn = this._classFn
    let exchange = this._exchange
    let exchange_type = this._exchange_type
    this._queue.then(function (ch) {
      ch.assertQueue(name_queue, {durable: true})
      ch.prefetch(1)
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", name_queue)
      if(exchange !== ''){
        ch.bindQueue(name_queue, exchange, 'x-delayed-message');
      }
      if(exchange !== '' && exchange_type !== ''){
        ch.bindQueue(name_queue, exchange, exchange_type);
      }
      ch.consume(name_queue, function (msg) {
        co(function * () {
          yield classFn[fn](ch,msg)
        })
      }, {noAck: noAck})
    })
  }
}

class ExtendedQueue extends mixin(
  Queue
) {}

module.exports = ExtendedQueue
