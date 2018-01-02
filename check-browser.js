if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    }
}

if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, ''); 
    }
}
  

var userAgentSplitted = navigator.userAgent.split(';');

var msie = navigator.userAgent.indexOf('MSIE') != -1;

if(msie)
    for (var i = 0; i < userAgentSplitted.length; i++) {
        var userAgentItem = userAgentSplitted[i].trim();
        if(userAgentItem.indexOf("MSIE") != -1){
            var userAgentItemSplitted = userAgentItem.split(" ");
            if(userAgentItemSplitted.length > 1)
                msie = parseInt(userAgentItemSplitted[1])
        }
    }


if(msie && msie < 8)
{
    document.body.innerHTML = "<h3>Ошибка - старая версия браузера!</h3>" 
    document.execCommand('Stop');
}    