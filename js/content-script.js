var current = {field: null, left: 0, top: 0, width: 0, height: 0};
var events = {
    onFocusInPassword: new OnEvent(),
    onFocusOutPassword: new OnEvent(),
    onKeyDown: new OnEvent(),
    onResize: new OnEvent()
};
var showIframe, closeIframe, focusIframe, locateIframe;

function setupListeners() {
    if (options.isEnabled()) {
        $(document).on('focus.fp', 'input:password', function() {
            events.onFocusInPassword.fireEvent(this);
        })
        .on('focusin.fp mousedown.fp', function(e) {
            if (!$(e.target).is('input:password')) {
                events.onFocusOutPassword.fireEvent();
            }
        })
        .on('keydown.fp', function(e) {
            events.onKeyDown.fireEvent(e);
        });

        $(window).on('resize.fp', function() {
            events.onResize.fireEvent();
        });

        $('input:password:focus').focus();
    } else {
        $(document).off('.fp');
        $(window).off('.fp');
    }
}

events.onFocusInPassword.addListener(function(field) {
    if (!current.field || current.field[0] !== field) {
        messages.page.broadcast('setupIframe', {options: options.local.cache, domain: $.getDomain()});
    }
    current.field = $(field);
});

if (isTopWindow()) {
    (function() {
        function updateCurrentFieldBounds(bounds) {
            if (isUndefined(bounds)) {
                var width = current.field.outerWidth();
                var height = current.field.outerHeight();
                var offset = current.field.offset();
                $.extend(current, {left: offset.left, top: offset.top, width: width, height: height});
            } else {
                $.extend(current, {left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height});
            }
        }

        showIframe = function(bounds) {
            updateCurrentFieldBounds(bounds);
            locateDialog();
            $('#flower-password-iframe').show();
        };
        closeIframe = function(focusCurrentField) {
            if ($('#flower-password-iframe').is(':visible')) {
                $('#flower-password-iframe').hide();
                messages.page.broadcast('iframeClosed', {focusCurrentField: focusCurrentField});
            }
        };
        focusIframe = function() {
            if ($('#flower-password-iframe').is(':visible')) {
                messages.page.broadcast('focusPassword');
            }
        };
        locateIframe = function(bounds) {
            updateCurrentFieldBounds(bounds);
            if ($('#flower-password-iframe').is(':visible')) {
                locateDialog();
            }
        };

        events.onResize.addListener(function() {
            if (current.field) {
                locateIframe();
            } else {
                messages.page.broadcast('windowResized');
            }
        });

        function calculateDialogOffset() {
            var result;
            if (current.left - $(document).scrollLeft() + current.width + $('#flower-password-iframe').outerWidth() <= $(window).width()) {
                result = {left: current.left + current.width, top: current.top};
            } else {
                result = {left: current.left, top: current.top + current.height};
            }
            return result;
        }

        var dialogOffset = null;
        function locateDialog(offset) {
            if (!offset) {
                offset = calculateDialogOffset();
            }
            $('#flower-password-iframe').css({left: offset.left + "px", top: offset.top + "px"});
            dialogOffset = offset;
        }

        function injectIframe() {
            // inject iframe except chrome pdf view
            if ($('body embed[type="application/pdf"]').length === 0) {
                if ($('#flower-password-iframe').size() > 0) {
                    return;
                }
                $('body').append('<iframe id="flower-password-iframe" src="' + getURL('iframe.html') + '" style="display: none;"></iframe>');
                if (options.isTransparent()) {
                    $('#flower-password-iframe').addClass('transparent');
                }
            }
        }

        options.onIframeReady.addListener(setupListeners);
        options.onReady.addListener(function() {
            injectIframe();
        });
        options.onSetEnabled.addListener(function() {
            if (!options.isEnabled()) {
                closeIframe();
            }
        });

        $.extend(messages.page.handlers, {
            iframeReady: function() {
                options.onIframeReady.fireEventOnce();
            },
            closeIframe: function(data) {
                closeIframe(data.focusCurrentField);
            },
            setIframeSize: function(data) {
                $('#flower-password-iframe').width(data.width).height(data.height);
                if (data.locate) locateDialog();
            },
            focusinIframe: function() {
                $('#flower-password-iframe').addClass('nontransparent');
            },
            focusoutIframe: function() {
                $('#flower-password-iframe').removeClass('nontransparent');
            },
            moveIframe: function(data) {
                locateDialog({left: dialogOffset.left + data.dx, top: dialogOffset.top + data.dy});
            },
            focusIframe: function() {
                focusIframe();
            },
            receiveMessage: function(data) {
                if (data.message === 'showIframe') {
                    showIframe(data);
                } else if (data.message === 'locateIframe') {
                    locateIframe(data);
                }
            }
        });
    })();
} // endif (isTopWindow())

if (isIframe()) {
    (function() {
        function getCurrentFieldBounds() {
            var width = current.field.outerWidth();
            var height = current.field.outerHeight();
            var box = current.field[0].getBoundingClientRect();
            return {left: box.left, top: box.top, width: width, height: height};
        }

        showIframe = function() {
            messages.page.sendTo(window, 'startMessage', $.extend({message: 'showIframe'}, getCurrentFieldBounds()));
        };
        closeIframe = function() {
            messages.page.sendToTop('closeIframe');
        };
        focusIframe = function() {
            messages.page.sendToTop('focusIframe');
        };
        locateIframe = function() {
            messages.page.sendTo(window, 'startMessage', $.extend({message: 'locateIframe'}, getCurrentFieldBounds()));
        };

        $.extend(messages.page.handlers, {
            windowResized: function() {
                if (current.field) {
                    locateIframe();
                }
            }
        });
    })();
} // endif (isIframe())

// commons for top window and iframes
(function() {
    events.onFocusInPassword.addListener(function() {
        showIframe();
    });
    events.onFocusOutPassword.addListener(function() {
        closeIframe();
    });
    events.onKeyDown.addListener(function(e) {
        if (e.matchKey(87, {alt: true})) {
            closeIframe();
        } else if (e.matchKey(83, {alt: true})) {
            focusIframe();
        }
    });

    $.extend(messages.page.handlers, {
        iframeClosed: function(data) {
            if (data.focusCurrentField && current.field) {
                events.onFocusInPassword.disable();
                current.field.focus();
                events.onFocusInPassword.enable();
            }
            current.field = null;
        },
        setCurrentFieldValue: function(data) {
            if (current.field) {
                current.field.valLimited(data.value);
            }
        }
    });

    options.onSetEnabled.addListener(setupListeners);

    function injectPageScript() {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', getURL('js/page.js'));
        document.head.appendChild(script);
    }
    injectPageScript();

    options.init();
})();