module.exports = require('./basic').extend({
    modelClass: null,
    query: null,
    sortProperty: null,
    sortDirection: 'ASC',

    setQ: function(q, instant, force) {
        if (q === this.get('q')) {
            return;
        }
        if (!force && !this.get('field.selector')) {
            return;
        }
        this.set('q', q);
        this.set('isLoading', true);
        if (instant || BD.store.allOfTypeIsLoaded(this.get('modelClass'))) {
            this.updateContent();
        } else {
            Em.run.cancel(this._updateContentTimeout)
            this._updateContentTimeout = Em.run.later(this, this.updateContent, 200);
        }
    },
    updateContent: function() {
        var self = this;
        var content = this.get('modelClass').filter({
            q: this.get('q'),
            query: _.extend({}, this.get('query'), this.get('field.query')),
            sortProperty: this.get('sortProperty'),
            sortDirection: this.get('sortDirection')
        });
        var oldContent = self.get('content');
        if (!oldContent || !oldContent.get('isLoaded')) {
            if (oldContent) {
                oldContent.destroy();
            }
            self.set('content', content);
        }
        content.promise.then(function() {
            //TODO: What happens if two requests are running simultaneously? The first one should probably be aborted
            self.set('isLoading', false);
            self.trigger('didLoad');
            var oldContent = self.get('content');
            if (content !== oldContent) {
                if (oldContent) {
                    oldContent.destroy();
                }
                self.set('content', content);
            }
            var selector = self.get('field.selector');
            if (selector) {
                selector.highlightOptionByIndex(0);
            }
        });
    },
    resetContent: function() {
        var content = this.get('content');
        if (content) {
            this.set('q', null);
            this.set('content', null);
            content.destroy();
        }
    },

    isLoaded: Em.computed.alias('content.isLoaded'),

    willDestroy: function() {
        this._super();
        this.resetContent();
    }
});
