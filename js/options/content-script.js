(function(options, messages) {
    if (isTopWindow()) {
        $.extend(options.global, {
            setCache: function(value) {
                if (!isUndefined(value)) {
                    options.global.cache = value;
                    options.onReady.fireEventOnce();
                }
            },
            loadAll: function() {
                messages.extension.send('getGlobalOptions');
            },
            set: function(name, value) {
                options.global.cache[name] = value;
                messages.extension.send('setGlobalOption', {name: name, value: value});
            }
        });

        $.extend(options, {
            onReady: new OnEvent(),
            onIframeReady: new OnEvent(),

            isTransparent: function() {
                return options.global.cache.transparent;
            },

            onSetEnabled: new OnEvent(),
            isDefaultEnabled: function() {
                return options.global.cache.defaultEnabled;
            },
            isEnabled: function() {
                if (isUndefined(options.local.cache.enabled)) {
                    return options.isDefaultEnabled();
                } else {
                    return options.local.cache.enabled;
                }
            },
            setEnabled: function(value) {
                options.local.set('enabled', value);
                options.onSetEnabled.fireEvent();
            },
            toggleEnabled: function() {
                options.setEnabled(!options.isEnabled());
            }
        });
        options.onIframeReady.addListener(function() {
            messages.page.broadcast('setLocalEnabled', {value: options.isEnabled()});
        });

        $.extend(messages.extension.handlers, {
            toggleLocalEnabled: function() {
                options.toggleEnabled();
                messages.all.broadcast('setLocalEnabled', {value: options.isEnabled()});
            },
            getLocalEnabled: function(data, reply) {
                reply('setLocalEnabled', {value: options.isEnabled()});
            },
            setGlobalOptions: function(data) {
                options.global.setCache(data.value);
                messages.extension.send('setLocalEnabled', {value: options.isEnabled()});
            }
        });

        $.extend(messages.page.handlers, {
            getLocalEnabled: function(data, reply) {
                if (options.onIframeReady.fired) {
                    reply('setLocalEnabled', {value: options.isEnabled()});
                }
            }
        });
    } // endif (isTopWindow())

    if (isIframe()) {
        $.extend(options.global, {
            loadAll: function() {},
            set: function() {}
        });

        $.extend(options, {
            onSetEnabled: new OnEvent(),
            isEnabled: function() {
                return options.local.cache.enabled;
            },
            setEnabled: function(value) {
                options.local.cache.enabled = value;
                options.onSetEnabled.fireEvent();
            }
        });

        $.extend(messages.page.handlers, {
            setLocalEnabled: function(data) {
                options.setEnabled(data.value);
            }
        });

        options.onInit.addListener(function() {
            messages.page.sendToTop('getLocalEnabled');
        });
    } // endif (isIframe())

    // commons for top window and iframes
    $.extend(messages.page.handlers, {
        setLocalOption: function(data) {
            if (current.field) {
                options.local.set(data.name, data.value);
            }
        }
    });
})(options, messages);
