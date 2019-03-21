Switchboard Operator
====================

[![Build status][build svg]][build status]
[![Gitlab build status][gitlab-ci build svg]][gitlab-ci build status]
[![Coverage][coverage svg]][coverage]
[![Pulls][release svg]][tags]
[![Pulls][pulls svg]][docker hub]

Switchboard Operator (a.k.a. SBO) is a production-ready service used to manage RabbitMQ flows between microservices.

![Switchboard operators image][switchboard operators]

TOC
---

- [Introduction](#introduction)
- [Use case example](#use-case-example)
- [Configuration example](#configuration-example)
- [Operators](#operators)
  * [Available actions to be defined in operators](#available-actions-to-be-defined-in-operators)
    + [`log`](#log)
    + [`http`](#http)
    + [`conditional`](#conditional)
      - [Conditional operations](#conditional-operations)
    + [`mapper`](#mapper)
    + [`prev2task`](#prev2task)
    + [`setter`](#setter)
    + [`template`](#template)
    + [`merger`](#merger)
    + [`telegram`](#telegram)
  * [Testing your operators](#testing-your-operators)
    + [Test example](#test-example)
- [Usage with docker](#usage-with-docker)
- [Visual representation of topology](#visual-representation-of-topology)
- [Known limitations](#known-limitations)
- [References](#references)
- [Licence](#licence)

Introduction
------------

Before starting, we recommend you reading [Anand Pate'ls post about Event-driven Microservices using RabbitMQ][event driven microservices using rabbitmq]. Most of the concepts in this software are based on his article.

It combines two main entities to structure this communication flow, and one to define how actions should be executed:

- **Events:** Events are triggered when something relevant happens in a microservice (a user has been created, a purchase is filled, etc); **events don't modify state**. They advice subscribed queues about anything happened in the system.

  Format: `microservice-name.entity-name` route `created|updated|deleted`

  This format means that when you create an event with name `whatever.entity` and route `created`, a queue of name `whatever.entity.created` will be created by SBO.

- **Tasks:** Tasks are actions which modify state. So every task has custom queues attached to microservices, listening for new tasks to realize.

  Format: `microservice-name.action-name`

- **Actions:** Actions are custom SwitchboardOperator entities triggered on the specific event & route their operator is listening to. Actions are similar to expressjs middlewares, they're executed in order for each received event.

You probably noticed we're using the word _Operator_ here. Operators are _recipe_ files written in yaml for both events and tasks.

> Note: both events and tasks also create one dead-letter queue for each queue created. Which means that you'll end up with at least two queues for each task or event.

This library uses [rabbot](https://github.com/arobson/rabbot) node module to manage the connection with Rabbitmq.

Use case example
----------------

You have a shop and payments, both as independent services. Until now they've been working pretty well just using REST calls, but now you want to add e-mails here and there, without adding logic for the emails service here and there specifically for this integration.

Instead of adding specific logic for the emails, you can call rabbitmq exchanges for every action you do on every service, such as adding a new shop order, receiving a payment, confirming it, etc.

Now you'll be thinking "you said without adding logic here and there", well yes, but this logic isn't content-aware. You ain't adding specific emails logic, instead you add a bunch of possible "events" which you can later listen to (or just ignore them).

So now you have both services full of events, but have nothing defined to listen at them. Here's where Switchboar Operator comes in hand.

You'll create an operator for each action you want to achieve. In this case, you may wanna send a confirmation e-mail after the order is made and another one after the payment has been confirmed. We'll create two operators for this:

- `shop-order-confirm-email`
- `shop-order-is-paid-email`

> Note: dashed naming is optional. You can use camel or pascal case if you preffer to do so.

Remember that the payment process is still working with REST, so in this case we only focus on the new service integration. Ofc you could also remove most of that REST logic and create new operators for things like marking an order as paid.

So, going back to the operators, each one will be linked to a different event, respectively:

- order.create: On order create we send an e-mail.
- order.update: On order update, we send an e-mail if status is now set as 'paid'.

As soon as we run switchboard operator with the just created operators it'll create four queues: one for each opertor plus one dead-letter for each too.

Configuration example
---------------------

~~~json
{
  "rabbitmq": {
    "host": "rabbithost",
    "port": 5672,
    "user": "rabbituser",
    "pass": "rabbitpass"
  },
  "tasks": [
    {
      "eventName": "emails"
    }
  ]
}
~~~

The service will automatically create dead-letter exchanges for failed messages, this way you won't lose messages when some operator fails.

*NOTE*: You should declare all tasks where you want to send your message using `prev2task` or `event2task` plugin.

Operators
---------

The actions to be executed when a message is received in a subscribed queue are grouped in files called operators. They'll group common actions in a specific context.

The operators are defined in yaml or json files stored in `operators` folder. This is the way you have to define what should happen every time you receive a message for a specific event.

To add new operators just drop your operator file to the `operators` folder.

Each Operator will create its own queue to manage its tasks, so you can have several operators listening the same event but maintaining different queues to process its actions. This way the work of an operator shouldn't interfere in the work of another operator.

Here's an example of an operator:

~~~yaml
# Execute every time a purchase is update
name: some-unique-name-for-this-operator
eventName: events.purchase
route: updated
# true by default, but here you can see you're able to disable them just adding this key.
enabled: true
actions:
  # Print event purchase logs
  - name: print-log
    type: log # Type log will use log plugin

  # Check if event purchase is paid
  - name: should-send-email
    # Type conditional will stop operator execution if some condition is not meet.
    type: conditional
    options:
      conditions:
      - field: paid
        operation: 'isTrue'
      - field: meta.sendEmail.to
        operation: defined

  # Convert event to email
  - name: map-event-to-email
    # Type mapper gets the previous action result and converts its fields to a new object with the specified structure.
    type: mapper
    options:
      fields:
        meta.sendEmail.to: to
        meta.sendEmail.template: template
        meta.sendEmail.subject: subject
        meta.sendEmail.from: from
        meta.sendEmail.transport: transport
        # map every other var in the scope to `vars`
        '*': vars

  # Send membership to emails queue applying
  - name: send-event-purchase-to-email-queue
    # Type prev2task gets the previous action message and sends it to a task queue.
    type: prev2task
    options:
      target: emails
      targetRoute: email.send

  # Send a telegram message to a specific group chat
  - name: send-telegram-message
    type: telegram
    # In case the Telegram API fails, ignore the error
    allowFailure: true
    options:
      chatId: '-12345'
      template: 'Member with e-mail {{ to }} has registered for event {{ vars.event.name }}'
~~~

### Available actions to be defined in operators

If you'd like to add new plugins you'll need to add them to `src/worker/executor-plugins`, and specify your plugin in the `index.ts` file of that folder. After doing so you'll need to rebuild the JS files from TS using `yarn run build`.

BTW we've created a bunch of plugins that may be useful to you:

#### `log`

Just prints the received object to stdout.

~~~yaml
- name: printLogToStdOut
  type: log
~~~

#### `http`

It makes an HTTP request, you can set the url using nunjucks templating. Ideal to execute webhooks with your AMQP events.

~~~yaml
- name: whatever
  type: http
  options:
    url: http://someurl.com/{{accept_template_int}}
    method: GET|POST|PUT|etc
    merge: true|false # We must merge response with the previous message
    mergeTarget: 'someField' # Where to merge the response? If not specified will be merged on the root level
~~~

#### `conditional`

It checks for defined conditions in the received object and aborts execution if some condition is not met.

~~~yaml
- name: whatever
  type: conditional
  options:
    conditions:
      - field: someReceivingObjField
        operation: ===
        checkValue: valueToCheckAgainst

~~~

> **Note:** enabling `allowFailure` here would make the plugin to not work as expected.

##### Conditional operations

- `true` | `isTrue`: Value is set as boolean `true`.
- `false` | `isFalse`: Value is set as boolean `false`.
- `defined`: Variable is defined.
- `undefined`: Variable is undefined.
- `empty`: Variable is undefined or empty.
- `notEmpty`: Variable is defined and NOT empty.
- `===`: Variable equals `checkValue`.
- `!==`: Variable does not equal `checkValue`.


#### `mapper`

It converts the message from the last action executed, to a new object following the specified mapping.

This plugin uses the [object-mapper library](https://github.com/wankdanker/node-object-mapper) behind the scenes, so you can use all mapping options available in such library, including wildcards.

~~~yaml
- name: membershipToEmailMapper
  type: mapper
  options:
    # (Optionally return a copy of previous message with the fields mapped being replaced)
    merge: false
    fields:
      whatever.name: result.fullname
      firstName: lastName
~~~

#### `prev2task`

It gets the message coming from the latest executed action and sends it to a the specified task.

~~~yaml
- name: sendMembershipToEmailQueue
  type: prev2task
  options:
    target: emails
    targetRoute: email.send
~~~

#### `setter`

Manually sets some object attributes to be consumed for the next operator's action.

~~~yaml
# Set paid attribte as true
- name: setPaidPayloadAttribute
  type: setter
  options:
    fields:
      paid: true
      message: Payment set to true
~~~

#### `template`

Manually sets some object attributes to be consumed for the next operator's action, additonally you can provide a nunjucks template as value.

~~~yaml
# Sets a new variable with nunjucks templating
- name: setMemberAsPaid
  type: template
  options:
    fields:
      message: 'The {{ member.name }} just paid'
~~~


#### `merger`

(Deep)merge specified input source keys to one output target key

~~~yaml
# Merge meta's ^^
- name: bookingToEmailBody
  type: merger
  options:
    sourceFields:
    - accountObj.meta.eventsMetaDefaults
    - user.metaDefaults
    - user.transportDefaults
    targetField: transport.myResultingMergedKey
~~~

Note that the order is important here. Priority is ascendant, which means that the latest specified source field will be the most priority one.

#### `telegram`

In order to use telegram plugin you first must set the telegram token in your config:

~~~json
{
  "plugins": {
    "telegram": {
      "token": "xxxxxxxxx:yyyyyyyyyyyyyyyyyyyyy--zzzzzzzzzzzz"
    }
  }
}
~~~

Then you can define your operator actions as follows:

~~~yaml
  # Send membership to logs for debugging purposes
  - name: logMembership
    type: telegram
    # recommended to allow failure, just to avoid telegram failures to break the operator flow
    allowFailure: true
    options:
      chatId: '-288888888'
      template: 'A new membership with {{ id }} has been registered'
      parseMode: html
      disableWebPagePreview: true
      disableNotification: true
~~~

Note that you can use any of the options specified by the [telegram bot API][], except for the `reply_markup` option, which has been ignored for SBO.

Also, all these options can be defined in the same config file where you defined the token. And you can overwrite any of those options from the operator itself (that includes the telegram token, so you can use multiple bots if you want).

We recommend to define both the token and the chatId in the config file. Although we also have the parseMode and other options there. That's up to you.

### Testing your operators

We've added a custom jest method to test your operators without the need of a rabbit endpoint.

To test them, you'll need to add a yaml file (or files, as you can define as many as you want) with the following structure:

~~~yaml
- name: operatorName
  description: An optional description of your test
  input:
    # ...
  output:
    # ...
  actions:
    actionName:
      description: An optional action check description
      output:
      # expected output in this exact point of the execution
  response:
    actionName:
      # ...
    otherActionName:
      # ...
~~~

Note that it's an array, so you can set as many tests as you want for each operator. You can also define you tests in different files, just remember to start always with `-` the first part of the entry, to ensure you use an array for testing them.

Let's see what's every part:

- `operatorName`: The operator name to be tested. Note that it must be `operatorName` not `operator-file-name`!
- `description`: Is shown during the tests, so you can properly know where the logs come from.
- `input`: The payload the queue should receive as input.
- `output`: How should it look after exiting.
- `actions`: Same as `output`, but action-specific. This way you can check any operator at any point of its execution. Each action must have an `output` definition. A `description` field is optional.
- `response`: Used by the HTTP plugin mock. Mocks responses for every specified `actionName`.

Once you have your operator and your `operators-tester.json` properly filled, you can test them with the specific `test-operators` task:

~~~bash
yarn test-operators
~~~

#### Test example

You have a full operator example in the [`operators`][operators] dir, named [`membersSignupDemo.yaml`][], and two tests for it in the [`test/files`][test] folder, named [`members-signup-1.yml`][] and [`members-signup-2.yml`][].

Running `yarn test-operators`:

[![asciicast](https://asciinema.org/a/2ITM6bcoPEeDVwJwX9BxgMjFo.svg)](https://asciinema.org/a/2ITM6bcoPEeDVwJwX9BxgMjFo)

Usage with docker
-----------------

Create your own operators under the folder `operators` in yaml or json format. The service will autoload all operators.

Then just run docker-compose:

~~~
docker-compose up -d
~~~

Visual representation of topology
---------------------------------

The project exports a visual representation of the configured topology. Just start the server with

~~~bash
node app.js
~~~

Open http://localhost:3000/topology

> Note: this feature is not properly tested and may not be working.

Known limitations
-----------------

- This microservice is prepared to work only with `direct` type rabbitmq exchanges.

References
----------

- [Event driven Microservices using RabbitMQ][event driven microservices using rabbitmq]
- [RabbitMQ – Best Practices For Designing Exchanges, Queues And Bindings?](https://derickbailey.com/2015/09/02/rabbitmq-best-practices-for-designing-exchanges-queues-and-bindings/)
- [Some tips about AMQP direct exchanges](http://blog.thedigitalcatonline.com/blog/2013/08/21/some-tips-about-amqp-direct-exchanges/#.Wd5CjR_nhhG)

Licence
-------

[MIT License](./LICENSE)

[switchboard operators]: https://upload.wikimedia.org/wikipedia/commons/8/8e/Photograph_of_Women_Working_at_a_Bell_System_Telephone_Switchboard_%283660047829%29.jpg "Switchboards operators"
[event driven microservices using rabbitmq]: https://runnable.com/blog/event-driven-microservices-using-rabbitmq
[telegram bot API]: https://core.telegram.org/bots/api#sendmessage

[build svg]: https://img.shields.io/travis/alvarium/switchboard-operator/master.svg?logo=travis
[gitlab-ci build svg]: https://img.shields.io/gitlab/pipeline/alvarium.io/switchboard-operator.svg?logo=gitlab
[coverage svg]: https://gitlab.com/alvarium.io/switchboard-operator/badges/master/coverage.svg
[pulls svg]: https://img.shields.io/docker/pulls/alvarium/switchboard-operator.svg?logo=docker
[release svg]: https://img.shields.io/github/release/alvarium/switchboard-operator.svg?logo=github

[tags]: https://github.com/alvarium/switchboard-operator/releases
[build status]: https://travis-ci.org/alvarium/switchboard-operator
[coverage]: https://gitlab.com/alvarium.io/switchboard-operator/-/jobs
[docker hub]: https://hub.docker.com/r/alvarium/switchboard-operator/
[gitlab-ci build status]: https://gitlab.com/alvarium.io/switchboard-operator/pipelines

[operators]: ./operators
[test]: ./test/files
[`membersSignupDemo.yaml`]: ./operators/membersSignupDemo.yaml
[`members-signup-1.yml`]: ./test/files/members-signup-1.yml
[`members-signup-2.yml`]: ./test/files/members-signup-2.yml
