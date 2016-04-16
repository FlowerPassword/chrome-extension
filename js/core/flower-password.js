(function() {
    function countCode(password, key){
        if(password && key){
            var md5one = $.md5(password,key);
            var md5two = $.md5(md5one,'snow');
            var md5three = $.md5(md5one,'kise');
            //计算大小写
            var rule = md5three.split("");
            var source = md5two.split("");
            for(var i=0;i<=31;i++){ 
                if(isNaN(source[i])){
                    var str ="sunlovesnow1990090127xykab";
                    if(str.search(rule[i]) > -1){
                        source[i] = source[i].toUpperCase();
                    }
                }
            }
            var code32 = source.join("");
            var code1 = code32.slice(0,1);
            if(isNaN(code1)){
                var code16 = code32.slice(0,16);
            }else{
                var code16 = "K" + code32.slice(1,16);
            }
            return [code16, code32];
        }
    }

    window.flowerPassword = {
        encrypt: function(password, key) {
            var result = countCode(password, key);
            return result && result[0];
        }
    };
})();
