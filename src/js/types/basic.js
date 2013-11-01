var t = require('../i18n').t;

module.exports = Em.Object.extend({
    inputValuePath: 'name',

    iconPath: null,
    
    selectorMinWidth: 200,
    
    content: null,
    isLoaded: true,
    setQ: Em.K,
    resetContent: Em.K,
    
    create: null,
    createTip: function() {
        var v = this.get('field.inputValue');
        if (v) {
            return t('create_model', {model: v});
        } else {
            return t('create_new');
        }
    }.property('field.inputValue'),
    
    noOptionsFoundText: t('no_options_found'),
    optionHeight: 27,
    optionViewClass: require('../option-view'),

    q: null
});