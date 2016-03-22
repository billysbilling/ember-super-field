module.exports = Ember.View.extend(require('./option-view-mixin'), {
    context: Em.computed.oneWay('content')
})
