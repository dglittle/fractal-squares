
function drawForkMe() {
    var m = window.location.href.match(/([^\/\.]+)\.github\.io\/([^\/]+)/)
    if (!m) return $('<div/>')
    var url = 'https://github.com/' + m[1] + '/' + m[2]    
    return $('<a href="' + url + '"><img width="64px" style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png" alt="Fork me on GitHub"></a>')
}

function initTwitter() {
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
}

function initFacebook(appId) {
    var callbacks = []

    // $('body').prepend($('<div id="fb-root"></div>'))
    $.ajaxSetup({ cache: true });
    $.getScript('//connect.facebook.net/en_UK/all.js', function(){
        FB.init({
            appId: appId,
        });     
        $('#loginbutton,#feedbutton').removeAttr('disabled');
        // FB.getLoginStatus(updateStatusCallback);

        _.each(callbacks, function (f) { f() })
        callbacks = null
    });

    waitForFacebook = function (func) {
        if (!callbacks) func()
        else callbacks.push(func)
    }
}

function drawTwitterButton(message) {
    if (!message) message = document.title
    var d = $('<a href="https://twitter.com/share" class="twitter-share-button">Tweet</a>').attr('data-text', message)
    setTimeout(function () {
        if ((typeof twttr) != 'undefined')
            twttr.widgets.load()
    }, 0)
    return d
}

function drawFacebookButton() {
    var d = $('<div class="fb-like" data-href="' + location.href + '" data-layout="button_count" data-action="like" data-show-faces="true" data-share="false"></div>')
    setTimeout(function () {
        waitForFacebook(function () {
            FB.XFBML.parse()
        })
    }, 0)
    return d
}

function canvasToPng(c) {
    var data = c[0].toDataURL("image/png")
    data = data.slice(data.indexOf(',') + 1)
    data = Base64.decode(data)
    return data
}

function postPngToFacebook(imageData, message) {
    function doPost() {
        var authToken = FB.getAuthResponse()['accessToken']
        var filename = 'image.png'
        var mimeType = 'image/png'

        var boundary = '----ThisIsTheBoundary1234567890'
        var formData = '--' + boundary + '\r\n'
        formData += 'Content-Disposition: form-data; name="source"; filename="' + filename + '"\r\n'
        formData += 'Content-Type: ' + mimeType + '\r\n\r\n'
        formData += imageData
        formData += '\r\n'
        formData += '--' + boundary + '\r\n'
        formData += 'Content-Disposition: form-data; name="message"\r\n\r\n'
        formData += message + '\r\n'
        formData += '--' + boundary + '--\r\n'
        
        var xhr = new XMLHttpRequest()
        xhr.open('POST', 'https://graph.facebook.com/me/photos?access_token=' + authToken, true)
        xhr.onload = xhr.onerror = function() {
            console.log(xhr.responseText)
        }
        xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary)

        // from: http://stackoverflow.com/a/5303242/945521
        if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
            XMLHttpRequest.prototype.sendAsBinary = function(string) {
                var bytes = Array.prototype.map.call(string, function(c) {
                    return c.charCodeAt(0) & 0xff;
                });
                this.send(new Uint8Array(bytes).buffer);
            };
        }

        xhr.sendAsBinary(formData)
    }

    waitForFacebook(function () {
        FB.getLoginStatus(function(res) {
            if (res.status == 'connected') {
                doPost()
            } else {
                FB.login(doPost, { scope : 'publish_stream' })
            }
        })
    })
}
