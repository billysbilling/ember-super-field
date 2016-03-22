var Popover = require('ember-popover');

module.exports = Popover.extend({
    layout: Popover.proto().layout,

    template: require('../templates/selector'),

    classNames: ['super-field-selector'],

    classNameBindings: ['type.create:has-create'],

    minHeight: 0,

    maxHeight: 300,

    minWidth: Em.computed.alias('type.selectorMinWidth'),

    field: null,

    type: Ember.computed.alias('field.type'),

    highlightedOption: null,

    createIsHighlighted: false,

    mouseDown: function(e) {
        return false;
    },

    didPressUp: function() {
        if (this.get('createIsHighlighted')) {
            this.highlightOptionByIndex(this.get('type.content.length')-1);
            return;
        }
        this.advanceHighlightedOption(-1);
    },

    didPressDown: function() {
        if (this.get('createIsHighlighted')) {
            return;
        }
        this.advanceHighlightedOption(1);
    },

    advanceHighlightedOption: function(delta) {
        var content = this.get('type.content'),
            highlightedOption = this.get('highlightedOption'),
            highlightedIndex = highlightedOption ? content.indexOf(highlightedOption) : -1;
        this.highlightOptionByIndex(highlightedIndex + delta);
    },

    highlightOptionByIndex: function(newIndex) {
        var self = this,
            content = this.get('type.content'),
            length,
            newOption;
        if (!content) {
            return;
        }
        length = content.get('length');
        if (!this.get('type.isLoaded')) {
            length = 1;
        }
        if (newIndex >= 0 && newIndex <= length - 1) {
            this.set('createIsHighlighted', false);
            newOption = content.objectAt(newIndex);
            if (newOption === BD.SPARSE_PLACEHOLDER) {
                var observerNotAdded = Ember.isNone(this.whenLoadedHighlightedIndex);
                this.whenLoadedHighlightedIndex = newIndex;
                if (observerNotAdded) {
                    content.one('didLoad', function() {
                        self.highlightOptionByIndex(self.whenLoadedHighlightedIndex);
                        self.whenLoadedHighlightedIndex = null;
                    });
                }
            } else {
                this.set('highlightedOption', newOption);
                Ember.run.next(this, this.scrollOptionIntoView);
            }
        } else if (newIndex == length && this.get('type').create) {
            this.set('highlightedOption', null);
            this.set('createIsHighlighted', true);
        }
    },

    scrollOptionIntoView: function() {
        if (this.get('isDestroying')) {
            return;
        }
        var list = this.$('.list'),
            option = this.$('.option.highlighted');
        if (!option.length) {
            return;
        }
        var stickyHeaderHeight = this._stickyGroup ? $(this._stickyGroup).find('.group-header').outerHeight() : 0,
            listHeight = list.outerHeight(),
            scrollTop = list.scrollTop(),
            scrollBottom = scrollTop + listHeight,
            optionTop = option.offset().top - list.offset().top + scrollTop,
            optionBottom = optionTop + option.outerHeight();
        if (optionTop < scrollTop + stickyHeaderHeight) {
            list.scrollTop(optionTop - stickyHeaderHeight);
        } else if (optionBottom > scrollBottom) {
            list.scrollTop(optionBottom - listHeight);
        }
    },

    didPressEnter: function() {
        if (this.get('createIsHighlighted')) {
            this.get('field').create();
        } else {
            var highlightedOption = this.get('highlightedOption');
            if (highlightedOption) {
                this.selectOption(highlightedOption);
            } else {
                this.get('field').hideSelector();
            }
        }
    },

    selectOption: function(option) {
        var field = this.get('field');
        field.hideSelector();
        field.selectOption(option);
    },

    listViewClass: function() {
        return require('ember-lazy-list').LazyItemView.detect(this.get('type.optionViewClass')) ? require('./lazy-list-view') : require('./list-view');
    }.property('type.optionViewClass'),

    createViewClass: require('./create-view'),

    didInsertElement: function() {
        this._super()
        this.$('.list').on('scroll', this.updateStickyGroup.bind(this))
    },

    _stickyGroup: null,

    _stickyGroupToBottom: null,

    updateStickyGroup: function(e) {
        var $list = this.$('.list')
        var listTop = $list.offset().top
        var groups = this.$('.group')
        var group
        var $group
        var groupTop
        var groupBottom
        var headerHeight
        var found
        var stickToBottom = false
        for (var i = 0; i < groups.length; i++) {
            group = groups[i]
            $group = $(group)
            groupTop = $group.offset().top
            groupBottom = groupTop + $group.outerHeight()
            headerHeight = $group.find('.group-header').outerHeight()
            if (listTop >= groupTop && listTop < groupBottom) {
                found = group
                if (groupBottom - headerHeight < listTop) {
                    stickToBottom = true
                }
                break
            }
        }

        if (this._stickyGroup === found && this._stickyGroupToBottom === stickToBottom) {
            //Nothing to do
        } else {
            $(this._stickyGroup).removeClass('sticky-group')
            $(this._stickyGroup).removeClass('sticky-group-bottom')
            $(found).addClass('sticky-group')
            if (stickToBottom) {
                $(found).addClass('sticky-group-bottom')
            }
            this._stickyGroup = found
            this._stickyGroupToBottom = stickToBottom
        }
    },

    groupedContentDidChange: function() {
        Em.run.schedule('afterRender', this, this.updateStickyGroup)
    }.observes('groupedContent')
});
