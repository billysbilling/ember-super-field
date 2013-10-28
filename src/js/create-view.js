module.exports = Em.View.extend({
    template: require('../templates/create'),
    
    classNames: ['create'],
    
    classNameBindings: ['parentView.createIsHighlighted:highlighted'],

    mouseUp: function() {
        this.get('parentView.field').create();
    },

    mouseEnter: function() {
        var selector = this.get('parentView');
        selector.set('highlightedOption', null);
        selector.set('createIsHighlighted', true);
    }
});
