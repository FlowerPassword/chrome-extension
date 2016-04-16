function isUndefined(value) {
    return typeof value === 'undefined';
}

function mergeFuns(firstFun, secondFun) {
    return function() {
        if (firstFun) firstFun.apply(this, arguments);
        if (secondFun) secondFun.apply(this, arguments);
    };
}

(function(win) {
    var topWindow = win.self === win.top;
    win.isTopWindow = function() {
        return topWindow;
    };
    win.isIframe = function() {
        return !topWindow;
    };
})(window);

if (typeof jQuery === 'function') {
    (function($) {
        function isModifierSet(modifier, name) {
            return !isUndefined(modifier) && (modifier[name] == true);
        }

        $.Event.prototype.matchKey = function(which, modifier) {
            var ctrl = isModifierSet(modifier, 'ctrl');
            var alt = isModifierSet(modifier, 'alt');
            var shift = isModifierSet(modifier, 'shift');
            var meta = isModifierSet(modifier, 'meta');
            return this.which == which && this.ctrlKey == ctrl && this.altKey == alt && this.shiftKey == shift && this.metaKey == meta;
        };

        $.fn.valLimited = function(value) {
            var maxlength = parseInt(this.prop('maxlength'));
            if (maxlength > 0 && maxlength < value.length) {
                value = value.slice(0, maxlength);
            }
            this.val(value);
            return this;
        }
    })(jQuery);
}

function OnEvent() {
    this.listeners = [];
    this.enabled = true;
    this.fired = false;
}
OnEvent.prototype = {
    addListener: function(listener) {
        this.listeners.push(listener);
    },
    fireEvent: function() {
        if (this.enabled) {
            this.fired = true;
            for (var i = 0; i < this.listeners.length; ++i) {
                this.listeners[i].apply(this, arguments);
            }
        }
    },
    fireEventOnce: function() {
        this.fireEvent.apply(this, arguments);
        this.disable();
    },
    disable: function() {
        this.enabled = false;
    },
    enable: function() {
        this.enabled = true;
    }
};
