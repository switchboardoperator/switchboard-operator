# switchboard-operator

[![Build status][build svg]][build status]

![Switchboard operatorstext](https://upload.wikimedia.org/wikipedia/commons/8/8e/Photograph_of_Women_Working_at_a_Bell_System_Telephone_Switchboard_%283660047829%29.jpg "Switchboards operators")

## Introduction

This service aims to manage AMQP (RabbitMQ) connections between our
microservices. It combines two main entities to structure this communication
flow and one to define which actions should be executed:

- Events: Avents are triggered when something relevant happens in a microservice
  (user created, email sent, etc), events doesn't modify state. They advice
  subscribed queues of anything happened in the system.

  Format: `microservice-name.entity-name` route `created|modified|deleted`

- Tasks: Tasks are queues attached to microservices, listing for new tasks to realize
  by the microservice listening

  Format: `microservice-name.action-name`

- Actions: You can trigger any of this actions on queue received messages. Actions are similar
  to expressjs middlewares, they're executed in order for each received event

This library uses [rabbot](https://github.com/arobson/rabbot) node module to manage the connection with Rabbitmq


## Configuration example

```json
{
  "rabbitmq": {
    "host": "rabbithost",
    "port": 5672,
    "user": "rabbituser",
    "pass": "rabbitpass"
  },
  "tasks": [
    {
      "eventName": "cfs-emails"
    }
  ]
}
```

**NOTE**: The service will automatically create dead-letter exchanges for failed messages, this way you won't lose messages when some operator will fail.
*NOTE*: You should declare all tasks where you want to send your message using `prev2task` or `event2task` plugin.

## Visual representation of topology

The project exports a visual representation of the configured topology. Just start the server with

```
node app.js
```

Open http://localhost:3000/topology

## Operators

The actions to be executed when a message is received in a subscribed queue are grouped in a files called operators. Operators should group some common actions in a specific context. The operators are defined in yaml files stored in `operators` folder. This is the way you have to define what should happen every time you receive a message for a specific event.
To add new operators just drop your operator yaml file to `operators` folder.

Each Operator will create its own queue to manage its tasks, so you can have several operators listening the same event but maintaining different queues to process its actions. This way the work of an operator shouldn't interfere in the work of another operator.

An example of operator can be seen

```yaml
# Execute every time a purchase is update
name: someUniqueName
eventName: events.purchase
route: updated
enabled: true
output: "interleaved|group|prefixed"
actions:
  # Print event purchase logs
  - name: print-log
    type: log # Type log will use log plugin

  # Check if event purchase is paid
  - name: shouldSendEmail
    type: conditional # Type conditional will stop operator execution if some condition is not meet.
    options:
      conditions:
        - field: paid
          operation: 'isTrue'
        - field: meta.sendEmail.to
          operation: defined

  # Convert event to email
  - name: eventToEmailMapper
    type: mapper # Type mapper get the previous action result and convert its fields to a new object with the requested structure.
    options:
      fields:
        'meta.sendEmail.to': 'to'
        'meta.sendEmail.template': 'template'
        'meta.sendEmail.subject': 'subject'
        'meta.sendEmail.from': 'from'
        'meta.sendEmail.transport': 'transport'
        '': 'vars'

  # Send membership to emails queue applying
  - name: sendEventPurchaseToEmailQueue
    type: prev2task # Type prev2task get the previous action message and send it to a task queue.
    options:
      target: cfs-emails
      targetRoute: email.send
```

### Available actions to be defined in operators

#### print-log

Just print the received object to stdout.

```yaml
- name: print-log
  type: log
```

#### http

It makes a HTTP request, you can set the url using nunjucks templating. Ideal to execute webhooks with your AMQP events.

```yaml
- name: whatever
  type: http
  options:
    url: http://someurl.com/{{accept_template_int}}
    method: GET|POST|PUT|etc
    merge: true|false # We must merge response with the previous message
    mergeTarget: 'someField' # Where to merge the response? If not specified will be merged on the root level
```

#### conditional

It checks for defined conditions in the received object and abort execution if some condition is not met.

```yaml
- name: whatever
  type: conditional
  options:
    conditions:
      - field: someReceivingObjField
        operation: ===
        checkValue: valueToCheckAgainst
```
#### mapper

It converts the message from the last action executed, to a new object following the mapping.
This plugin is using the [object-mapper](https://github.com/wankdanker/node-object-mapper) library behind the scenes, so you can use all mapping options avilable in the library, including wildcards.

```yaml
- name: membershipToEmailMapper
  type: mapper
  options:
    merge: false # (Optionally return a copy of previous message with the fields mapped being replaced)
    fields:
      whatever.name: 'result.fullname'
      firstName: 'lastName'
```

#### prev2task

It gets the message comming from the last action executed and send it to a defined task.

```yaml
- name: sendMembershipToEmailQueue
  type: prev2task
  options:
    target: cfs-emails
    targetRoute: email.send
```

#### setter

Manually set some object attributes to be consumed for the next operator's action.

```yaml
# Set paid attribte as true
- name: setPaidPayloadAttribute
  type: setter
  options:
    fields:
      paid: true
      message: 'Payment set to true'
```

#### telegram

In order to use telegram plugin you must set the telegram token in your config:

```json
  "plugins": {
    "telegram": {
      "token": "xxxxxxxxx:yyyyyyyyyyyyyyyyyyyyy--zzzzzzzzzzzz"
    }
  }
```

Then you can define your operator action as it follows:

```yaml
  # Send membership to logs for debugging purposes
  - name: logMembership
    type: telegram
    options:
      chatId: '-288888888'
      template: 'A new membership with {{ id }} has been registered'
```

## Usage with docker

Create your own operators under the folder `operators` in yaml format. The service will autoload all operators.
Then just run docker-compose.

```
docker-compose up -d
```

## Known limitations

- This microservice is prepared to work only with `direct` type rabbitmq exchanges

## References

- https://runnable.com/blog/event-driven-microservices-using-rabbitmq
- https://derickbailey.com/2015/09/02/rabbitmq-best-practices-for-designing-exchanges-queues-and-bindings/
- http://blog.thedigitalcatonline.com/blog/2013/08/21/some-tips-about-amqp-direct-exchanges/#.Wd5CjR_nhhG

## Licence

MIT

[build status]: https://travis-ci.org/alvarium/switchboard-operator
[build svg]: https://img.shields.io/travis/alvarium/switchboard-operator/master.svg?style=flat-square
