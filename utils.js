
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function isRetina() {
    return window.devicePixelRatio > 1
}

function getWindowSize() {
    return [window.innerWidth, window.innerHeight]
}

function createCheckBox(label, check, cb) {
    var d = $('<span/>')

    var c = $('<input type="checkbox"/>')
    var id = _.randomString(10, /[a-z]/)
    c.attr('id', id)
    c.prop('checked', !!check)
    if (cb) c.change(cb)
    d.append(c)

    if (typeof(label) == "string") label = $('<span/>').text(label)
    d.append($('<label for="' + id + '"/>').append(label))

    return d
}

function getRelPos(d, e) {
    var pos = d.offset()
    var x = e.pageX - pos.left
    var y = e.pageY - pos.top
    return [x, y]
}

function grabMouse(d, cb, onUp) {
    d.on('mousedown', function (e) {
        e.preventDefault()
        cb(getRelPos(d, e))

        var oldMove = document.onmousemove
        document.onmousemove = function (e) {
            cb(getRelPos(d, e))
        }
        
        var oldUp = document.onmouseup
        document.onmouseup = function (e) {
            if (onUp) onUp()
            document.onmousemove = oldMove
            document.onmouseup = oldUp
        }
    })
    d.on('touchstart', function (e) {
        e.preventDefault()
        cb(getRelPos(d, e.originalEvent.touches[0]))

        var oldMove = document.ontouchmove
        document.ontouchmove = function (e) {
            e.preventDefault()
            cb(getRelPos(d, e.touches[0]))
        }

        var oldEnd = document.ontouchend;
        var oldCancel = document.ontouchcancel
        document.ontouchend = document.ontouchcancel = function (e) {
            if (onUp) onUp()
            document.ontouchmove = oldMove
            document.ontouchend = oldEnd
            document.ontouchcancel = oldCancel
        }
    })
}

function grabMouseRelative(d, onDown, cb, onUp) {
    var lastPos = null
    grabMouse(d, function (pos) {
        if (!lastPos) {
            if (onDown) onDown(pos)
        } else {
            cb(sub(pos, lastPos), pos)
        }
        lastPos = pos
    }, function () {
        if (onUp) onUp(lastPos[0], lastPos[1])
        lastPos = null
    })
}

var tau = Math.PI * 2

function zeros(n) {
    var sum = []
    for (var i = 0; i < n; i++)
        sum.push(0)
    return sum
}

function sum(x) {
    var sum = 0
    for (var i = 0; i < x.length; i++)
        sum += x[i]
    return sum
}

function op(x, y, op) {
    var sum = []
    var n = (x instanceof Array) ? x.length : y.length
    for (var i = 0; i < n; i++) {
        sum.push(op(
            (x instanceof Array) ? x[i] : x,
            (y instanceof Array) ? y[i] : y))
    }
    return sum
}

function sub(x, y) {
    return op(x, y, function (x, y) { return x - y })
}

function add(x, y) {
    return op(x, y, function (x, y) { return x + y })
}

function mul(x, y) {
    return op(x, y, function (x, y) { return x * y })
}

function div(x, y) {
    return op(x, y, function (x, y) { return x / y })
}

function dot(x, y) {
    return sum(mul(x, y))
}

function distSq(x, y) {
    if (y !== undefined) return distSq(sub(x, y))
    return dot(x, x)
}
magSq = distSq

function dist(x, y) {
    return Math.sqrt(distSq(x, y))
}
mag = dist

function norm(x) {
    return div(x, dist(x))
}

function matmul(a, b) {
    var m = []
    for (var r = 0; r < a.length; r++) {
        m[r] = []
        for (var c = 0; c < b[0].length; c++) {
            m[r][c] = 0
            for (var i = 0; i < b.length; i++) {
                m[r][c] += a[r][i] * b[i][c]
            }
        }
    }
    return m
}

function comparator(f, desc) {
    return function (a, b) {
        if (f) {
            a = f(a)
            b = f(b)
        }
        if (a < b) return desc ? 1 : -1
        if (a > b) return desc ? -1 : 1
        return 0
    }
}

function splitSizeHelper2(size) {
    if (size == null) return ""
    if (size <= 1) return Math.round(100 * size) + '%'
    return size + 'px'
}

function splitHorzMedian(aSize, bSize, a, b, median, fill) {
    if (fill === undefined) fill = true
    aSize = _.splitSizeHelper('width', aSize)
    bSize = _.splitSizeHelper('width', bSize)
    mSize = splitSizeHelper2(median)
    var t = $('<table ' + (fill ? 'style="width:100%;height:100%"' : '') + '><tr valign="top"><td class="a" ' + aSize + '></td><td width="' + mSize + '"><div style="width:' + mSize + '"/></td><td class="b" ' + bSize + '></td></tr></table>')
    // don't do this:
    // t.find('.a').append(a)
    // t.find('.b').append(b)
    var _a = t.find('.a')
    var _b = t.find('.b')
    _a.append(a)
    _b.append(b)
    return t
}

function grid(rows) {
    var t = []
    t.push('<table style="width:100%;height:100%">')
    _.each(rows, function (row, y) {
        t.push('<tr height="33.33%">')
        _.each(row, function (cell, x) {
            var c = 'x' + x + 'y' + y
            t.push('<td class="' + c + '" width="33.33%"/>')
        })
        t.push('</tr>')
    })
    t.push('</table>')
    t = $(t.join(''))

    _.each(rows, function (row, y) {
        _.each(row, function (cell, x) {
            var c = 'x' + x + 'y' + y
            t.find('.' + c).append(cell)
        })
    })

    return t
}

function center(me) {
    var t = $('<table style="width:100%;height:100%"><tr><td valign="center" align="center"></td></tr></table>')
    t.find('td').append(me)
    return t
}

$.fn.myAppend = function (args) {
    for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i]
        if (a instanceof Array)
            $.fn.myAppend.apply(this, a)
        else
            this.append(a)
    }
    return this
}

function cssMap(s) {
    var m = {}
    if (s) {
        _.each(s.split(';'), function (s) {
            var a = s.split(':')
            if (a[0])
                m[_.trim(a[0])] = _.trim(a[1])
        })
    }
    return m
}

$.fn.myCss = function (s) {
    return this.css(cssMap(s))
}

$.fn.myHover = function (s, that) {
    var that = that || this
    var m = cssMap(s)
    var old = _.map(m, function (v, k) {
        return that.css(k)
    })
    this.hover(function () {
        that.css(m)
    }, function () {
        that.css(old)
    })
    return this
}

function rotate(me, amount) {
    var s = 'rotate(' + amount + 'deg)'
    me.css({
        '-ms-transform' : s,
        '-moz-transform' : s,
        '-webkit-transform' : s,
        '-o-transform' : s
    })
    return me
}

jQuery.fn.extend({
    rotate : function (amount) {
        return this.each(function () {
            rotate($(this), amount)
        })
    },
    enabled : function (yes) {
        if (yes === undefined)
            return !$(this[0]).attr('disabled')
        return this.each(function () {
            if (yes) $(this).removeAttr('disabled')
            else $(this).attr('disabled', 'disabled')
        })
    }
})

jQuery.fn.extend({
    rotate : function (amount) {
        return this.each(function () {
            rotate($(this), amount)
        })
    }
})

function createThrobber() {
    var d = $('<span/>')
    var anim = [
        '|---',
        '-|--',
        '--|-',
        '---|',
        '--|-',
        '-|--'
    ]
    var start = _.time()
    var i = setInterval(function () {
        if ($.contains(document.documentElement, d[0])) {
            var t = (_.time() - start) / 1000
            t *= 3
            d.text(anim[Math.floor(t % anim.length)])
        } else clearInterval(i)
    }, 30)
    return d
}
