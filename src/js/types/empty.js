module.exports = require('./basic').extend({
    content: function() {
        return Em.A();
    }.property()
});