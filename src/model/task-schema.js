const EventSchema = require('./event-schema')

module.exports = EventSchema.extend({
  route: {
    type: String,
    required: false
  }
}, {
  methods: {
    toQueue: function() {
      return
    }
  }
})
