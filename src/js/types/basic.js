var t = require('../i18n-context').t;

module.exports = Em.Object.extend(Em.Evented, {
    inputValuePath: 'name',

    iconPath: null,

    selectorMinWidth: 200,

    content: null,
    isLoading: false,
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
    optionViewClass: require('../lazy-option-view'),

    q: null,

    groupBy: null,

    groupName: null,

    groupSort: function(a, b) {
        return (a.name || '').localeCompare(b.name)
    },

    isGrouped: function() {
        return !!this.get('groupBy')
    }.property('groupBy'),

    groupedContent: function() {
        var groupBy = this.get('groupBy')
        var groupName = this.get('groupName') || groupBy
        var groups = this.get('content').reduce(function(groups, item) {
            var key = item.get(groupBy)
            if (!groups[key]) {
                groups[key] = {
                    name: typeof groupName === 'function' ? groupName(item) : item.get(groupName),
                    items: []
                }
            }
            groups[key].items.push(item)
            return groups
        }, {})
        var groupsList = []
        Object.keys(groups).forEach(function(key) {
            groupsList.push(groups[key])
        })
        groupsList.sort(this.groupSort)
        return groupsList
    }.property('content.@each')
});
