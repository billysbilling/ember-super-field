module.exports = Em.Mixin.create({
    template: require('../templates/option'),

    classNames: ['option'],

    classNameBindings: ['isHighlighted:highlighted'],

    //Default for lazy list items, is overridden when used as grouped
    selector: Em.computed.oneWay('parentView.parentView'),

    isHighlighted: function() {
        var content = this.get('controller.content') || this.get('content');
        return (content.get('isLoaded') !== false && content === this.get('selector.highlightedOption'));
    }.property('selector.highlightedOption'),

    mouseUp: function() {
        var content = this.get('controller.content') || this.get('content');
        this.get('selector').selectOption(content);
    },

    mouseEnter: function() {
        var content = this.get('controller.content') || this.get('content');
        var selector = this.get('selector');
        selector.set('highlightedOption', content);
        selector.set('createIsHighlighted', false);
    }
});
