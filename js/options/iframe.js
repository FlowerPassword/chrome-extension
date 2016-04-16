(function(options, messages) {
    $.extend(options.local, {
        loadAll: function() {
            options.onReady.fireEventOnce();
        },
        set: function(name, value) {
            options.local.cache[name] = value;
            messages.page.broadcast('setLocalOption', {name: name, value: value});
        }
    });

    $.extend(options, {
        onReady: new OnEvent(),

        isCheckPasswordStrength: function() {
            return options.global.cache.checkPasswordStrength;
        },

        isTransparent: function() {
            return options.global.cache.transparent;
        },

        isCopyToClipboard: function() {
            return options.global.cache.copyToClipboard;
        },

        hasLastKey: function() {
            return options.global.cache.saveLastKey && !isUndefined(options.local.cache.lastKey);
        },
        getLastKey: function() {
            return options.local.cache.lastKey;
        },
        setLastKey: function(value) {
            if (options.global.cache.saveLastKey) {
                options.local.set('lastKey', value);
            } else {
                options.removeLastKey();
            }
        },
        removeLastKey: function() {
            options.local.set('lastKey', undefined);
        },

        isFillKeyWithDomain: function() {
            return options.global.cache.fillKeyWithDomain;
        },
        setFillKeyWithDomain: function(value) {
            options.global.set('fillKeyWithDomain', value);
        },

        isDefaultAppendScramble: function() {
            return options.global.cache.defaultAppendScramble;
        },
        isAppendScramble: function() {
            if (isUndefined(options.local.cache.appendScramble)) {
                return options.isDefaultAppendScramble();
            } else {
                return options.local.cache.appendScramble;
            }
        },
        setAppendScramble: function(value) {
            options.local.set('appendScramble', value);
        },

        getScramble: function() {
            return options.global.cache.scramble;
        },
        setScramble: function(value) {
            options.global.set('scramble', value);
        }
    });
})(options, messages);
