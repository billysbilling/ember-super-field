module.exports = Em.Mixin.create({
    template: require('../templates/option'),
    
    classNames: ['option'],
    
    classNameBindings: ['isHighlighted:highlighted'],
    
    isHighlighted: function() {
        var content = this.get('controller.content');
        return (content.get('isLoaded') !== false && content === this.get('parentView.parentView.highlightedOption'));
    }.property('parentView.parentView.highlightedOption'),

    mouseUp: function() {
        this.get('parentView.parentView').selectOption(this.get('controller.content'));
    },
    
    mouseEnter: function() {
        var selector = this.get('parentView.parentView');
        selector.set('highlightedOption', this.get('controller.content'));
        selector.set('createIsHighlighted', false);
    }
});