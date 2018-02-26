# switchboard-operator API

![Switchboard operatorstext](https://c1.staticflickr.com/7/6079/6081891190_72e39f2e78_z.jpg "Switchboards operators")

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

options:
```yaml
- name: whatever
  type: http
  options
    url: http://someurl.com/{{accept_template_int}}
    method: GET|POST|PUT|etc
```

#### conditional

It checks for defined conditions in the received object and abort execution if some condition is not met.

options:
```yaml
- name: whatever
  type: conditional
  options
    conditions:
      - field: someReceivingObjField
        operation: ===
        checkValue: valueToCheckAgainst
```
#### mapper

It converts the message from the last action executed, to a new object following the mapping

options:

```yaml
- name: membershipToEmailMapper
  type: mapper
  options:
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

#### event2task

The same as prev2task but getting the first message received without alteration.

event2task definition:
```yaml
- name: whatever
  type: event2task
  options:
    target: task-exchange
    targetRoute: route-to-send-to
```

Send previous generated object to task

## Known limitations

- This microservice is prepared to work only with `direct` type rabbitmq exchanges

## References

- https://runnable.com/blog/event-driven-microservices-using-rabbitmq
- https://derickbailey.com/2015/09/02/rabbitmq-best-practices-for-designing-exchanges-queues-and-bindings/
- http://blog.thedigitalcatonline.com/blog/2013/08/21/some-tips-about-amqp-direct-exchanges/#.Wd5CjR_nhhG

## Licence

MIT
