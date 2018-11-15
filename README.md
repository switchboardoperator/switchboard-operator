Switchboard Operator
====================

[![Build status][build svg]][build status]

Switchboard Operator (a.k.a. SBO) is a production-ready service used to manage RabbitMQ flows between microservices.

![Switchboard operators image][switchboard operators]

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

Visual representation of topology
---------------------------------

The project exports a visual representation of the configured topology. Just start the server with

~~~bash
node app.js
~~~

Open http://localhost:3000/topology

> Note: this feature is not properly tested and may not be working.

## Operators

The actions to be executed when a message is received in a subscribed queue are grouped in files called operators. They'll group common actions in a specific context.

The operators are defined in yaml or json files stored in `operators` folder. This is the way you have to define what should happen every time you receive a message for a specific event.

To add new operators just drop your operator file to the `operators` folder.

Each Operator will create its own queue to manage its tasks, so you can have several operators listening the same event but maintaining different queues to process its actions. This way the work of an operator shouldn't interfere in the work of another operator.

Here's an example of an operator:

~~~yaml
# Execute every time a purchase is update
name: someUniqueName
eventName: events.purchase
route: updated
# true by default, but here you can see you're able to disable them just adding this key.
enabled: true
output: "interleaved|group|prefixed"
actions:
  # Print event purchase logs
  - name: print-log
    type: log # Type log will use log plugin

  # Check if event purchase is paid
  - name: shouldSendEmail
    # Type conditional will stop operator execution if some condition is not meet.
    type: conditional
    options:
      conditions:
      - field: paid
        operation: 'isTrue'
      - field: meta.sendEmail.to
        operation: defined

  # Convert event to email
  - name: eventToEmailMapper
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
  - name: sendEventPurchaseToEmailQueue
    # Type prev2task gets the previous action message and sends it to a task queue.
    type: prev2task
    options:
      target: emails
      targetRoute: email.send
~~~

### Available actions to be defined in operators

If you'd like to add new plugins you'll need to add them to `src/worker/executor-plugins`, and specify your plugin in the `index.ts` file of that folder. After doing so you'll need to rebuild the JS files from TS using `yarn run build`.

BTW we've created a bunch of plugins that may be useful to you:

#### `print-log`

Just prints the received object to stdout.

~~~yaml
- name: print-log
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
    options:
      chatId: '-288888888'
      template: 'A new membership with {{ id }} has been registered'
~~~

### Testing your operators

We've added a custom jest method to test your operators without the need of a rabbit endpoint.

To test them, you'll need to add an `operators-tester.json` file under `tests` folder with the following structure:

~~~json
{
  "operatorName": [
    {
      "input": {},
      "output": {},
      "response": {
        "actionName": {}
      }
    }
  ],
}
~~~

Note that it's an array, so you can set as many tests as you want for each operator.

Let's see what's every part:

- `operatorName`: The operator name to be tested. Note that it must be `operatorName` not `operator-file-name`!
- `input`: The payload the queue should receive as input.
- `output`: How should it look after exiting.
- `response`: Used by the HTTP plugin mock. Mocks responses for every specified `actionName`.

Once you have your operator and your `operators-tester.json` properly filled, you can test them with the specific `test-operators` task:

~~~bash
yarn test-operators
~~~

### Test example

Given the next operator file:

~~~yaml
# Execute every time a purchase is update
name: membersSignup
eventName: members.signup
route: created
# true by default, but here you can see you're able to disable them just adding this key.
enabled: true
actions:
  # Print everything to the log
  - name: print-log
    type: log

  # Getting account info
  - name: getMetaInfo
    type: http
    options:
      url: http://your-awesome-endpoint.io/{{ member.account }}
      method: GET
      merge: true
      mergeTarget: _account

  # Copy all contents to vars to be used in email
  - name: copyAllToVars
    type: mapper
    options:
      copy:
      - vars

  # Merge email configuration
  - name: mergeTransportSettings
    type: merger
    options:
      sourceFields:
      - vars._account.meta.emailConfig
      - vars.privateMeta.emailConfig
      targetField: vars._email

  # Convert event to email
  - name: mapEmailFields
    # Type mapper gets the previous action result and converts its fields to a new object with the specified structure.
    type: mapper
    options:
      fields:
        vars.member.email: to
        vars._email.transport: transport
        vars._email.template: template
        vars._email.subject: subject
        vars._email.apikey: apikey
        vars._email.from: from
        # map every other var in the scope to `vars`, so the mail template has access to them.
        '*': vars

  # Send members to emails queue applying
  - name: sendSignupConfirmationEmail
    type: prev2task
    options:
      target: emails
      targetRoute: email.send
~~~

The tester should look like:

~~~json
{
  "membersSignup": [
    {
      "input": {
        "member": {
          "name": "John Doe",
          "email": "john@doe.com",
          "account": "3a696232-b214-4d58-af8b-01e793c2a424"
        },
        "privateMeta": {
          "emailConfig": {
            "template": "members/signups",
            "subject": "Welcome {{ vars._email.name }}!"
          }
        }
      },
      "response": {
        "getMetaInfo": {
          "meta": {
            "emailConfig": {
              "transport": "sendgrid",
              "template": "alvarium/default",
              "apikey": "Our awesome sendgrid api key ;)"
            }
          }
        }
      },
      "output": {
        {
          "subject": "Welcome {{ vars._email.name }}!",
          "template": "members/signups",
          "to": "john@doe.com",
          "transport": "sendgrid",
          "apikey": "Our awesome sendgrid api key ;)",
          "vars": [
            {
              "_account": {
                "meta": {
                  "emailConfig": {
                    "apikey": "Our awesome sendgrid api key ;)",
                    "template": "alvarium/default",
                    "transport": "sendgrid"
                  }
                }
              },
              "_email": {
                "apikey": "Our awesome sendgrid api key ;)",
                "subject": "Welcome {{ vars._email.name }}!",
                "template": "members/signups",
                "transport": "sendgrid"
              },
              "member": {
                "account": "3a696232-b214-4d58-af8b-01e793c2a424",
                "email": "john@doe.com",
                "name": "John Doe"
              },
              "privateMeta": {
                "emailConfig": {
                  "subject": "Welcome {{ vars._email.name }}!",
                  "template": "members/signups"
                }
              }
            }
          ]
        }
      }
    }
  ]
}
~~~

Running `yarn test-operators`:

[![asciicast](https://asciinema.org/a/anUUbfqvuI7XoOjnmmB1RZFMe.svg)](https://asciinema.org/a/anUUbfqvuI7XoOjnmmB1RZFMe)

## Usage with docker

Create your own operators under the folder `operators` in yaml or json format. The service will autoload all operators.

Then just run docker-compose:

~~~
docker-compose up -d
~~~

Known limitations
-----------------

- This microservice is prepared to work only with `direct` type rabbitmq exchanges.

## References

- [Event driven Microservices using RabbitMQ][event driven microservices using rabbitmq]
- [RabbitMQ – Best Practices For Designing Exchanges, Queues And Bindings?](https://derickbailey.com/2015/09/02/rabbitmq-best-practices-for-designing-exchanges-queues-and-bindings/)
- [Some tips about AMQP direct exchanges](http://blog.thedigitalcatonline.com/blog/2013/08/21/some-tips-about-amqp-direct-exchanges/#.Wd5CjR_nhhG)

## Licence

MIT

[switchboard operators]: https://upload.wikimedia.org/wikipedia/commons/8/8e/Photograph_of_Women_Working_at_a_Bell_System_Telephone_Switchboard_%283660047829%29.jpg "Switchboards operators"
[event driven microservices using rabbitmq]: https://runnable.com/blog/event-driven-microservices-using-rabbitmq
[build status]: https://travis-ci.org/alvarium/switchboard-operator
[build svg]: https://img.shields.io/travis/alvarium/switchboard-operator/master.svg?style=flat-square
