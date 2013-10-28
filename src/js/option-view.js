module.exports = require('ember-lazy-list').LazyItemView.extend({
    template: require('../templates/option'),
    
    classNames: ['option'],
    
    classNameBindings: ['isHighlighted:highlighted'],
    
    isHighlighted: function() {
        var content = this.get('content');
        return (content.get('isLoaded') !== false && content === this.get('parentView.parentView.highlightedOption'));
    }.property('parentView.parentView.highlightedOption'),

    mouseDown: function() {
        return false;
    },

    mouseUp: function() {
        this.get('parentView.parentView').selectOption(this.get('content'));
    },
    
    mouseEnter: function() {
        var selector = this.get('parentView.parentView');
        selector.set('highlightedOption', this.get('content'));
        selector.set('createIsHighlighted', false);
    }
});