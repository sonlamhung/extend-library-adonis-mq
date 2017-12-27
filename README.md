# adonis-mq library and client for AdonisJs and Node.JS

[![Build Status](https://travis-ci.org/squaremo/amqp.node.png)](https://travis-ci.org/squaremo/amqp.node)

    npm install git+http://git.luci.vn/lucnn/adonis-mq.git
<br>
### Setting up the provider
All providers are registered inside `bootstrap/app.js` file.

```javascript
const providers = [
  'adonis-mq/providers/MqProvider'
]
```

### Setting up the alias
Aliases makes it easier to reference a namespace with a short unique name. Aliases are also registered inside `bootstrap/app.js` file.

```javascript
const aliases = {
  Mq: 'Adonis/Addons/Mq'
}
```

Setup process is done. Let's use the **Mq** provider now.

<br>
### Bash Commands
Below are the bash commands to create required directories. Equivalent commands for windows can be used.

```bash
mkdir app/Mq
mkdir app/Mq/Controllers
touch app/Mq/queue.js
```

### Loading queue.js file.
Next we need to do is loading the `queue.js` file when starting the server. Which will be inside `bootstrap/http.js` file.
Paste the below line of code after `use(Helpers.makeNameSpace('Http', 'routes'))`

```javascript
use(Helpers.makeNameSpace('Mq', 'queue'))
```
<br>

## example file app/Mq/queue.js

```javascript
'use strict'

const Mq = use('Mq')
Mq.queue('ReceiveController.worker', 5, true) // mame queue , max channel connected , noAck (true, false)
Mq.queue('ReceiveController.worker1', 5)
```

## example file app/Mq/Controllers/ReceiveController.js

```javascript
'use strict'
const Env = use('Env')

class ReceiveController {
  constructor(channel, request, presence) {
    this.channel = channel
    this.request = request
    console.log('Channel Connected')
  }

  worker(ch, msg) {
    console.log('start worker')
    console.log('Received message : %s', msg.content.toString())
    setTimeout(function () {
      ch.ack(msg)
      console.log('done worker')
    }, 5000)
  }

  worker1(ch, msg) {
    console.log('start worker1')
    console.log('Received message : %s', msg.content.toString())
    setTimeout(function () {
      ch.ack(msg)
      console.log('done worker1')
    }, 5000)
  }

  worker2(ch, msg) {
    console.log('start worker2')
    console.log('Received message : %s', msg.content.toString())
    setTimeout(function () {
      ch.ack(msg)
      console.log('done worker2')
    }, 5000)
  }
}

module.exports = ReceiveController
```

## example file config/mq.js

```javascript
'use strict'
const Env = use('Env')
module.exports = {

  useHttpServer: true,
  server_rabbit: 'amqp://locahost'

}

```
