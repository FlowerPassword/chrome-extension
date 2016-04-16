(function() {
    var hsimp = window.hsimp = {};
    var levels = hsimp.levels = {
        weak: 0, normal: 1, strong: 2
    };

    hsimp.check = function(password) {
        var result = {
            level: levels.strong,
            messages: []
        };
        for (var i in hsimp.checks) {
            var r = hsimp.checks[i](password);
            if (!isUndefined(r)) {
                result.level = Math.min(r.level, result.level);
                result.messages.push(r.message);
            }
        }
        return result;
    };
    hsimp.checks = {
        'Common Password': function (password) {
            if (hsimp.commonPasswords[password]) {
                return {
                    level: levels.weak,
                    message: '该密码是常用密码之一，可被瞬间破解'
                };
            }
        },
        'Length': function (password) {
            if (password.length < 5) {
                return {
                    level: levels.weak,
                    message: '该密码太短，请使用8位或以上的密码'
                };
            } else if (password.length < 8) {
                return {
                    level: levels.normal,
                    message: '该密码比较短，请使用8位或以上的密码'
                };
            }
        },
        'Character Variety': function (password) {
            if (password.match(/^[A-Za-z]+$/)) {
                return {
                    level: levels.normal,
                    message: '该密码只包含字母，加入数字和符号可提高强度'
                };
            } else if (password.match(/^[0-9]+$/)) {
                return {
                    level: levels.normal,
                    message: '该密码只包含数字，加入字母和符号可提高强度'
                };
            } else if (password.match(/^[A-Za-z0-9]+$/)) {
                return {
                    level: levels.normal,
                    message: '该密码只包含数字和字母，加入符号可提高强度'
                };
            }
        },
        'Repeated Pattern': function (password) {
            if (password.match(/(.+)\1{2,}/gi)) {
                return {
                    level: levels.weak,
                    message: '该密码包含重复的部分，这使其更容易被破解'
                };
            }
        },
        'Possibly a Word': function (password) {
            if (password.match(/^[a-zA-Z]+$/)) {
                return {
                    level: levels.weak,
                    message: '该密码可能是一个单词或一个名字，如果是的话，这将使其很容易被破解'
                };
            }
        },
        'Possibly a Telephone Number / Date': function (password) {
            if (password.match(/^[\-\(\)\.\/\s0-9]+$/)) {
                return {
                    level: levels.weak,
                    message: '该密码可能是一个电话号码或一个日期，如果是的话，这将使其很容易被破解'
                };
            }
        },
        'Possibly a Word and a Number': function (password) {
            if (password.match(/^[a-zA-Z]+[0-9]+$/) || password.match(/^[0-9]+[a-zA-Z]+$/)) {
                return {
                    level: levels.weak,
                    message: '该密码可能是一个单词和几个数字的组合，这是很常见的模式，因此可以被快速的破解'
                };
            }
        }
    };
})();