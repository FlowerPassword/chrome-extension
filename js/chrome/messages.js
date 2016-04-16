var messages = {};

(function() {
    messages.extension = {
        send: function(action, data) {
            chrome.extension.sendMessage($.extend({action: action}, data), function(response) {
                if (response) {
                    var handler = messages.extension.handlers[response.action];
                    if (handler) {
                        handler(response);
                    }
                }
            });
        },
        sendTo: function(tab, action, data) {
            chrome.tabs.sendMessage(tab, $.extend({action: action}, data), function(response) {
                if (response) {
                    var handler = messages.extension.handlers[response.action];
                    if (handler) {
                        handler(response, function(){}, {tab: {id: tab}});
                    }
                }
            });
        },
        handlers: {}
    };

    messages.page = {
        broadcast: function(action, data) {
            chrome.extension.sendMessage($.extend({action: action, transit: true}, data), function(){});
        },
        sendTo: function(target, action, data) {
            target.postMessage($.extend({action: action, flowerPassword: true}, data), '*');
        },
        sendToTop: function(action, data) {
            if (window.top) {
                messages.page.sendTo(window.top, action, data);
            } else {
                chrome.extension.sendMessage($.extend({action: action, transit: true}, data), function(response) {
                    if (response) {
                        var handler = messages.page.handlers[response.action];
                        if (handler) {
                            handler(response);
                        }
                    }
                });
            }
        },
        handlers: {}
    };

    messages.all = {
        broadcast: function(action, data) {
            messages.extension.send(action, data);
            messages.page.broadcast(action, data);
        }
    };

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        var handler = null;
        if (request.transit) {
            handler = messages.page.handlers[request.action];
        } else {
            handler = messages.extension.handlers[request.action];
        }
        if (handler) {
            var replied = false;
            handler(request, function(action, data) {
                replied = true;
                sendResponse($.extend({action: action}, data));
            }, sender);
            if (!replied) {
                sendResponse({});
            }
        }
    });

    $(window).on('message', function(e) {
        var data = e.originalEvent.data;
        if (typeof data === 'object' && data.flowerPassword) {
            var handler = messages.page.handlers[data.action];
            if (handler) {
                handler(data, function(){});
            }
        }
    });
})();
