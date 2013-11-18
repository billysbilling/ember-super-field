var i18n = require('./i18n'),
    BasicType = require('./types/basic');

module.exports = require('ember-text-field').extend({
    classNames: ['super-field'],
    
    classNameBindings: ['hasStringValue', 'hasStringValue:has-value'],
    
    autocomplete: 'off',

    allowKeyInput: true,
    
    init: function() {
        this.initType();
        this._super();
        var self = this;
        this.addObserver('value.'+this.get('type.inputValuePath'), this, function() {
            self.reformatInputValue();
        });
        if (this.get('autoSelectIfOne')) {
            var type = this.get('type'),
                content;
            type.setQ('', true, true);
            content = type.get('content');
            type.get('content').promise.then(function() {
                if (content.get('length') == 1) {
                    self.set('value', content.get('firstObject'));
                }
            });
        }
    },

    superFieldRecordWillChange: function() {
        if (this._recordStringValueBinding) {
            this._recordStringValueBinding.disconnect(this);
            this._recordStringValueBinding = null;
        }
    }.observesBefore('record'),

    superFieldRecordDidChange: function() {
        var r = this.get('record'),
            stringName = this.get('stringName');
        if (r && stringName) {
            this._recordStringValueBinding = this.bind('stringValue', 'record.'+ stringName);
        }
    }.observes('record').on('init'),
    
    allowStringValue: false,
    stringName: null,
    stringValue: '',
    hasStringValue: function() {
        return (this.get('stringValue') && !this.get('hasFocus'));
    }.property('hasFocus', 'stringValue'),
    
    autoSelectIfOne: false,
    
    initType: function() {
        var type = this.get('type');
        if (typeof type === 'string') {
            var typeName = type;
            type = this.container.lookup('super-field-type:'+typeName);
            Ember.assert('Invalid super field type name: '+typeName, type);
        } else {
            Ember.assert('Invalid super field type: '+type, type instanceof BasicType);
        }
        type.set('field', this);
        this.set('type', type);
    },
    
    query: null,
    
    icon: function() {
        return this.get('value.' + this.get('type.iconPath'));
    }.property('value'),
    
    selectOnFocus: true,
    picker1Icon: 'icons/caret-down',
    
    didClickPicker1: function() {
        if (this.get('selector')) {
            this.hideSelector();
        } else {
            if (!Em.isEmpty(this.get('type.q'))) {
                this.get('type').resetContent();
            }
            this.showSelector();
            this.get('type').setQ('', true);
        }
        this.focus();
    },

    allowUnformatInputValue: false,
    formatInputValue: function(value) {
        var inputValuePath = this.get('type.inputValuePath');
        return Em.isEmpty(value) ? this.get('inputValue') : (inputValuePath ? value.get(inputValuePath) : '');
    },
    
    //Value handling
    superFieldValueDidChange: function() {
        if (this.get('value')) {
            this.set('stringValue', null);
        } else {
            this.set('inputValue', '');
        }
    }.observes('value'),
    superFieldInputValueDidChange: function() {
        if (this.get('allowStringValue') && !this.get('value')) {
            this.set('stringValue', this.get('inputValue'));
        }
        this.get('type').setQ(this.get('inputValue'));
    }.observes('inputValue'),
    didBlur: function() {
        this._super();
        if (Em.isEmpty(this.get('value')) && !this.get('allowStringValue')) {
            this.set('inputValue', '');
        }
    },


    //DOM events
    didInsertElement: function() {
        this._super();
        var input = this.$('input');
        input.keydown(Billy.proxy(this.didKeyDown, this));
    },
    willDestroyElement: function() {
        this._super();
        this.get('type').destroy();
        this.hideSelector();
    },

    didKeyDown: function(e) {
        var self = this,
            key = e.keyCode || e.which,
            hasModifier = e.ctrlKey || e.metaKey;
        switch (key) {
            case $.keyCode.ESCAPE:
            case $.keyCode.UP:
            case $.keyCode.DOWN:
            case $.keyCode.ENTER:
                e.preventDefault();
                break;
        }
        Em.run(function() {
            self.doDidKeyDown(key, hasModifier);
        });
    },
    doDidKeyDown: function(key, hasModifier) {
        switch (key) {
            case $.keyCode.ESCAPE:
                this.hideSelector();
                break;
            case $.keyCode.TAB:
                this.hideSelector();
                break;
            case $.keyCode.UP:
                this.didPressUp();
                break;
            case $.keyCode.DOWN:
                this.didPressDown();
                break;
            case $.keyCode.ENTER:
                this.didPressEnter();
                break;
            case $.keyCode.LEFT:
            case $.keyCode.RIGHT:
            case 91: //Left command
            case 93: //Right command
            case 18: //Alt
            case 17: //Control
            case 16: //Shift
                //Ignore
                break;
            default:
                if (this.get('allowKeyInput')) {
                    //Ignore everything with Ctrl or Cmd
                    if (hasModifier) {
                        break;
                    }
                    this.set('value', null);
                    if (!this.get('selector')) {
                        this.get('type').resetContent();
                        this.showSelector();
                    }
                }
                break;
        }
    },

    //Key handling
    didPressUp: function() {
        var selector = this.get('selector');
        if (selector) {
            selector.didPressUp();
        }
    },
    didPressDown: function() {
        var selector = this.get('selector');
        if (selector) {
            selector.didPressDown();
        } else {
            this.showSelector();
            this.get('type').setQ(this.get('inputValue'), true);
            this.get('selector').highlightOptionByIndex(0);
        }
    },
    didPressEnter: function() {
        var selector = this.get('selector');
        if (selector) {
            selector.didPressEnter();
        }
    },
    
    //Selector
    showSelector: function() {
        var self = this,
            selector = this.get('selector');
        if (!selector) {
            selector = require('./selector').create({
                container: this.container
            });
            this.set('selector', selector);
            selector.set('field', this);
            selector.one('willDestroyElement', function() {
                self.set('selector', null);
            });
            selector.show(this);
        }
    },
    hideSelector: function() {
        var selector = this.get('selector');
        if (selector) {
            selector.destroy();
        }
    },
    selectOption: function(option) {
        this.set('value', option);
        this.sendAction('didSelect', option);
    },

    
    //Create
    create: function() {
        var self = this,
            type = this.get('type'),
            create = type.get('create');
        Ember.assert('No create method set on superfield type.', create);
        this.hideSelector();
        create.call(type, this.get('inputValue'), function(value) {
            self.set('value', value);
        });
        this.set('inputValue', '');
        this.set('value', null);
    }
});

module.exports.types = {
    Basic: require('./types/basic'),
    Model: require('./types/model'),
    Empty: require('./types/empty')
};

module.exports.OptionView = require('./option-view');

module.exports.lang = i18n.lang;