$(function() {
    options.init();

    options.global.set = mergeFuns(options.global.set, function(name, value) {
        chrome.extension.sendMessage({action: 'setGlobalOption', name: name, value: value}, function(){});
    });

    $('#default-enabled').prop("checked", options.global.cache.defaultEnabled).change(function() {
        options.global.set('defaultEnabled', this.checked);
    });
    $('#password-strength').prop("checked", options.global.cache.checkPasswordStrength).change(function() {
        options.global.set('checkPasswordStrength', this.checked);
    });
    $('#transparent').prop("checked", options.global.cache.transparent).change(function() {
        options.global.set('transparent', this.checked);
    });
    $('#copy-to-clipboard').prop("checked", options.global.cache.copyToClipboard).change(function() {
        options.global.set('copyToClipboard', this.checked);
    });
    $('#last-key').prop("checked", options.global.cache.saveLastKey).change(function() {
        options.global.set('saveLastKey', this.checked);
    });
    $('#fill-key').prop("checked", options.global.cache.fillKeyWithDomain).change(function() {
        options.global.set('fillKeyWithDomain', this.checked);
    });
    $('#append-scramble').prop("checked", options.global.cache.defaultAppendScramble).change(function() {
        options.global.set('defaultAppendScramble', this.checked);
    });
    $('#scramble').val(options.global.cache.scramble).change(function() {
        options.global.set('scramble', this.value);
    }).keyup(function() {
        $(this).change();
    });
});
