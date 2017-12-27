'use strict'

/*
 * adonis-mq
 *
 * (c) Luci <lucnn@luci.vn>
 *
*/

const amqp = require('../../');
const Ioc = require('adonis-fold').Ioc
const Queue = require('../Queue')
const Middleware = require('../Middleware')
const CE = require('../Exceptions')
const defaultConfig = require('../../examples/config')
const sessionMethodsToDisable = ['put', 'pull', 'flush', 'forget']

class Mq {

  constructor (Config, Request, Server, Session, Helpers) {
    class RabSession extends Session {
    }
    this.config = Config.get('mq', defaultConfig)
    this.conn = null
    this.config.useHttpServer ? this.attach() : null
    this.Request = Request
    this.Session = RabSession
    this.Helpers = Helpers
    this.controllersPath = 'Mq/Controllers'

    /**
     * Channels pool to store channel instances. This is done
     * to avoid multiple channel instantiation.
     *
     * @type {Object}
     */
    this._queuesPool = {}
    /**
     * Here we override methods on the session provider extended
     * class to make sure the end user is not mutating the
     * session state, since we do not have access to the
     * response object.
     */
    sessionMethodsToDisable.forEach((method) => {
      this.Session.prototype[method] = function () {
        throw CE.RuntimeException.invalidAction('Cannot mutate session values during websocket request')
      }
    })
  }


  /**
   * Returns a new/existing channel instance for
   * a given namespace.
   *
   * @param {String} name
   * @param {Function|Class} closure
   *
   * @return {Object} channelInstance
   *
   * @throws {Error} when trying to access a non-existing channel
   */
  queue (name_queue,channel_start = 1, noAck = false) {
    const clac = this.paserQueueName(name_queue)
    var name = clac[1];
    var closure = clac[0];

    if(isNaN(channel_start) == true || channel_start <= 0){ throw new Error('max_channel khong dung'); }

    /**
     * If closure is a string. Resolve it as a controller from autoloaded
     * controllers.
     */
    var nameClass = closure
    if (typeof (closure) === 'string') {
      closure = Ioc.use(this.Helpers.makeNameSpace(this.controllersPath, closure))
    }
    for (var i = 0;i < channel_start;i++){
      new Queue(this.conn, this.Request, this.Session, name, closure, nameClass, noAck)
    }
    return {'name_queue': nameClass+'.'+name,'count_channel': i}
  }

  paserQueueName(name_queue){
    const clac = name_queue.split(".")
    if(clac.length !== 2){ throw new Error('name quene khong dung'); }
    return clac
  }
  /**
   * Attach a custom http server. Make sure to call
   * attach before creating channels.
   *
   * @param {Object} server
   */
  attach () {
    if(this.config.server_rabbit == null){ throw new Error('Url server Rabbit Null');}
    this.conn = amqp.connect(this.config.server_rabbit)
    perMessageDeflate: false
  }

  /**
   * Register global middleware
   *
   * @param {Array} list
   */
  global (list) {
    Middleware.global(list)
  }

  /**
   * Register named middleware
   *
   * @param {Object} set
   */
  named (set) {
    Middleware.named(set)
  }
}

module.exports = Mq
