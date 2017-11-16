'use strict'

/*
 * adonis-mq
 *
 * (c) Luci <lucnn@luci.vn>
 *
*/

const ServiceProvider = require('adonis-fold').ServiceProvider

class MqProvider extends ServiceProvider {

  * register () {
    this.app.singleton('Adonis/Addons/Mq', (app) => {
      const Rab = require('../src/Mq')
      const Config = app.use('Adonis/Src/Config')
      const Request = app.use('Adonis/Src/Request')
      const Server = app.use('Adonis/Src/Server')
      const Session = app.use('Adonis/Src/Session')
      const Helpers = app.use('Adonis/Src/Helpers')
      return new Rab(Config, Request, Server, Session, Helpers)
    })
  }

}

module.exports = MqProvider
