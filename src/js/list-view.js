module.exports = require('ember-lazy-list').LazyListView.extend({
    itemViewClass: null,
    
    rowHeight: Ember.computed.alias('parentView.type.optionHeight'),

    scrollContainer: function() {
        return this.$().parent('.list');
    }.property()
});