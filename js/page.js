// we need this script injected into the page context, because we cannot get
// contentWindow from iframe, nor get parent or top window inside iframe, in the
// context of content script
(function(win, doc) {
    win.addEventListener('message', function(e) {
        var data = e.data;
        if (typeof data === 'object' && data.flowerPassword) {
            var actionHandler = handlers[data.action];
            if (actionHandler) {
                actionHandler(e);
            }
        }
    });

    var handlers = {
        startMessage: function(e) {
            e.data.action = 'bubbleMessage';
            win.parent.postMessage(e.data, '*');
        },
        bubbleMessage: function(e) {
            var iframeElement = findIframe(e.source);
            if (iframeElement) {
                var box = iframeElement.getBoundingClientRect();
                var padding = getPadding(iframeElement);
                if (box) {
                    e.data.left += box.left + padding.left + iframeElement.clientLeft;
                    e.data.top += box.top + padding.top + iframeElement.clientTop;
                    if (win.self === win.top) {
                        var body = doc.body;
                        var clientLeft = doc.clientLeft || body.clientLeft || 0;
                        var clientTop = doc.clientTop || body.clientTop || 0;
                        var scrollLeft = win.pageXOffset;
                        var scrollTop = win.pageYOffset;
                        e.data.left += scrollLeft - clientLeft;
                        e.data.top += scrollTop - clientTop;
                        e.data.action = 'receiveMessage';
                        win.postMessage(e.data, '*');
                    } else {
                        win.parent.postMessage(e.data, '*');
                    }
                }
            }
        }
    };

    function getPadding(element) {
        var paddingTop = parseInt(element.style.paddingTop) || 0;
        var paddingLeft = parseInt(element.style.paddingLeft) || 0;
        return {left: paddingLeft, top: paddingTop};
    }

    function findIframe(source) {
        return findByTag(source, 'iframe') || findByTag(source, 'frame');
    }

    function findByTag(source, tagName) {
        var elements = doc.getElementsByTagName(tagName);
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].contentWindow === source) {
                return elements[i];
            }
        }
    }
})(window, document);