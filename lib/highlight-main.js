/* 
 * @Author: login
 * @Date:   2014-10-23 13:27:55
 * @Last Modified by:   login
 * @Last Modified time: 2014-10-24 13:24:49
 */

/* lineHighlight main object
 * @element - unique Selector of element who contains text
 */
var lineHighlight = function(element) {
    var self = this;

    // Reference to parent element ID
    self.elementID = element;
    // Current row of active child element
    self.currentIndex = null;
    // Array containing objects of Child elements
    self.childElements = null;

    // TODO - add some customizable options
    self.options = {
        // APPLET, AREA, BGSOUND, EMBED, IMG, MAP, NOEMBED, OBJECT, PARAM, 
        // BUTTON, FIELDSET, FORM, INPUT, ISINDEX, LABEL, LEGEND, OPTGROUP, OPTION, SELECT, TEXTAREA,         
        // FRAME, FRAMESET, NOFRAMES, IFRAME,         
        ignoredEl: ['UL', 'A', 'IMG', 'CANVAS', 'INPUT', 'SELECT', 'TEXTAREA', 'STRONG'],
        linkshortcut: true,
        linkshortcutHtml: '°'
    };

    // Current active element properties
    self.element = {
            el: document.querySelector(self.elementID),
            style: null,
            width: null,
            height: null,
            lineHeight: null,
            totalRows: null,
            highlightEl: null,
            highlightElShortcut: null,
            top: 0,
            left: 0
        }
        // Initialization of our mose event
    self.mouseEvent = new CustomEvent('mousechange', {
        'x': null,
        'y': null
    });
    // Init on main element
    // Populates self.element with dimensions and other properties
    self.initElementDimensions();

    // TODO: Register root window events currently only resize()
    self.initRootEvents();

    // Loops all child elements expect those in self.options.ignoredEl and add mouse events to them
    self.initChildEvents();

    // Create our placeholder. Fixed div that is displayed as highlighter
    self.createHighlightPlaceholder();

    // TODO: Check if shortcut is needed??
    self.checkUrlForHash();
};

lineHighlight.prototype.checkUrlForHash = function() {
    var self = this;

    var line = window.location.hash.substr(self.elementID.length);
    console.log(line);
    // if(!isNaN(line)){
    //     console.log(line);
    // }

};

lineHighlight.prototype.initChildEvents = function() {
    var self = this;
    self.childElements = self.element.el.querySelectorAll("*");

    // Loop through all our collected elements
    for (var i = 0; i < self.childElements.length; i++) {

        // Check if valid NODE
        if (self.childElements[i].nodeType !== 1) {
            continue;
        }
        // Check if node isn't in forbidden nodes array
        if (self.options.ignoredEl.indexOf(self.childElements[i].nodeName) !== -1) {
            continue;
        }
        // Check if node isn't empty
        if (self.childElements[i].innerHTML.replace(/<(?:.|\n)*?>/gm, '').length === 0) {
            continue;
        }
        // EVENT LISTENERS:
        // DETECT mouse enter on new element and set element dimensions and update or create highlighter, dispatch event
        self.childElements[i].addEventListener("mouseenter", function(e) {
            self.element.el = e.currentTarget;

            self.initElementDimensions();

            e = e || window.event;

            var target = e.target || e.srcElement,
                rect = target.getBoundingClientRect(),
                offsetX = e.clientX - rect.left,
                offsetY = e.clientY - rect.top;

            self.mouseEvent.x = offsetX;
            self.mouseEvent.y = offsetY;
            // Dispatch the event.
            self.element.el.dispatchEvent(self.mouseEvent);
        });
        // DETECT mousemovment inside element get coordinates and dispatching event!!
        self.childElements[i].addEventListener("mousemove", function(e) {
            self.element.el = e.currentTarget;
            e = e || window.event;

            var target = e.target || e.srcElement,
                rect = target.getBoundingClientRect(),
                offsetX = e.clientX - rect.left,
                offsetY = e.clientY - rect.top;


            self.mouseEvent.x = offsetX;
            self.mouseEvent.y = offsetY;
            // Dispatch the event.
            self.element.el.dispatchEvent(self.mouseEvent);
        });

        // Listen for event and processes it!
        self.childElements[i].addEventListener('mousechange', function(e) {
            self.element.el = e.currentTarget;
            // If we are on new ROW lets highlight it
            var currentPos = Math.floor(self.mouseEvent.y / self.element.lineHeight) + 1;
            if (currentPos !== self.currentIndex || (currentPos === 1 && self.currentIndex === 1)) {
                self.currentIndex = currentPos;
                if (self.currentIndex <= self.element.totalRows) {
                    // We are on new row adjust position vars of element
                    self.element.X = self.element.el.offsetTop;
                    self.element.Y = self.element.el.offsetLeft;

                    self.highlightRow();
                } else {
                    self.element.highlightEl.style.display = 'none';
                }

            }
        }, false);
    }
}

lineHighlight.prototype.initRootEvents = function() {
    var self = this;
    window.addEventListener('resize', function(event) {
        self.initElementDimensions();
    });
};

lineHighlight.prototype.highlightRow = function() {
    var self = this;
    var calculated;
    if (self.currentIndex === 1) {
        calculated = self.element.X;
    } else {
        calculated = self.element.X + ((self.currentIndex - 1) * self.element.lineHeight);
    }
    self.element.highlightEl.style.width = self.element.width + 'px';
    self.element.highlightEl.style.height = self.element.lineHeight + 'px';
    self.element.highlightEl.style.top = calculated + 'px';
    self.element.highlightEl.style.display = 'block';

    // SET BOOKMARKS
};
lineHighlight.prototype.getPosition = function() {
    var rect;
    var borderLeftWidth = parseInt(this.element.style['borderLeftWidth'], 10);
    var borderTopWidth = parseInt(this.element.style['borderTopWidth'], 10);

    this.element.X = 0;
    this.element.X = 0;

    rect = this.element.el.getBoundingClientRect();

    this.element.X = e.clientX - borderLeftWidth - rect.left;
    this.element.X = e.clientY - borderTopWidth - rect.top;
};

lineHighlight.prototype.initElementDimensions = function() {
    var self = this;

    // Get element computed style
    if (window.getComputedStyle) {
        self.element.style = window.getComputedStyle(self.element.el, null)
    } else {
        self.element.style = self.element.el.currentStyle
    }

    // Get Container height, width and line height
    self.element.height = parseFloat(self.element.style.getPropertyValue("height"));
    self.element.width = parseFloat(self.element.style.getPropertyValue("width"));

    if (parseFloat(self.element.style.getPropertyValue("font-size")) > parseFloat(self.element.style.getPropertyValue("line-height"))) {
        self.element.lineHeight = parseFloat(self.element.style.getPropertyValue("font-size"));
    } else {
        self.element.lineHeight = parseFloat(self.element.style.getPropertyValue("line-height"));
    }

    // Total rows of text in element
    self.element.totalRows = Math.round(self.element.height / self.element.lineHeight);
};
lineHighlight.prototype.createHighlightPlaceholder = function() {
    var self = this;
    // Our main highlight element!!
    this.element.highlightEl = document.createElement('div');
    this.element.highlightEl.setAttribute('class', 'highlighter');
    this.element.highlightEl.style.position = 'absolute';

    // Or link shortcut element
    if (this.options.linkshortcut === true) {
        var shortcutParent = null;
        // Our main highlight element!!
        shortcutParent = document.createElement('div');
        shortcutParent.setAttribute('class', 'highlighter-actions');


        // Our main highlight element!!
        this.element.highlightElShortcut = document.createElement('div');
        this.element.highlightElShortcut.setAttribute('class', 'highlighter-link');
        this.element.highlightElShortcut.innerHTML = this.options.linkshortcutHtml;

        this.element.highlightElShortcut.addEventListener("click", function(e) {
            self.copyToClipboard();
        });

        shortcutParent.appendChild(this.element.highlightElShortcut);
        this.element.highlightEl.appendChild(shortcutParent);
    }

    this.element.el.appendChild(this.element.highlightEl);


};

lineHighlight.prototype.getLineUrl = function() {
    window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
};


lineHighlight.prototype.copyToClipboard = function() {
    var desc = "Copy to clipboard: Ctrl+C, Enter";
    window.prompt(desc, 'URL');
};

// 3rd PARTY ADDONS, SOME DOCUMENT POLYFILLS

// https://github.com/inexorabletash/polyfill/blob/master/polyfill.js#L642
// Document.querySelectorAll method
// http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed
// Needed for: IE7-
if (!document.querySelectorAll) {
    document.querySelectorAll = function(selectors) {
        var style = document.createElement('style'),
            elements = [],
            element;
        document.documentElement.firstChild.appendChild(style);
        document._qsa = [];
        style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
        window.scrollBy(0, 0);
        style.parentNode.removeChild(style);
        while (document._qsa.length) {
            element = document._qsa.shift();
            element.style.removeAttribute('x-qsa');
            elements.push(element);
        }
        document._qsa = null;
        return elements;
    };
};

// Document.querySelector method
// Needed for: IE7-
if (!document.querySelector) {
    document.querySelector = function(selectors) {
        var elements = document.querySelectorAll(selectors);
        return (elements.length) ? elements[0] : null;
    };
};
// Document.getElementsByClassName method
// Needed for: IE8-
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function(classNames) {
        classNames = String(classNames).replace(/^|\s+/g, '.');
        return document.querySelectorAll(classNames);
    };
};

// https://github.com/jonathantneal/Polyfills-for-IE8/blob/master/getComputedStyle.js
// getComputedStyle
!('getComputedStyle' in this) && (this.getComputedStyle = (function() {
    function getPixelSize(element, style, property, fontSize) {
        var
            sizeWithSuffix = style[property],
            size = parseFloat(sizeWithSuffix),
            suffix = sizeWithSuffix.split(/\d/)[0],
            rootSize;

        fontSize = fontSize != null ? fontSize : /%|em/.test(suffix) && element.parentElement ? getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null) : 16;
        rootSize = property == 'fontSize' ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;

        return (suffix == 'em') ? size * fontSize : (suffix == 'in') ? size * 96 : (suffix == 'pt') ? size * 96 / 72 : (suffix == '%') ? size / 100 * rootSize : size;
    }

    function setShortStyleProperty(style, property) {
        var
            borderSuffix = property == 'border' ? 'Width' : '',
            t = property + 'Top' + borderSuffix,
            r = property + 'Right' + borderSuffix,
            b = property + 'Bottom' + borderSuffix,
            l = property + 'Left' + borderSuffix;

        style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]] : style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]] : style[l] == style[r] ? [style[t], style[r], style[b]] : [style[t], style[r], style[b], style[l]]).join(' ');
    }

    function CSSStyleDeclaration(element) {
        var
            currentStyle = element.currentStyle,
            style = this,
            fontSize = getPixelSize(element, currentStyle, 'fontSize', null);

        for (property in currentStyle) {
            if (/width|height|margin.|padding.|border.+W/.test(property) && style[property] !== 'auto') {
                style[property] = getPixelSize(element, currentStyle, property, fontSize) + 'px';
            } else if (property === 'styleFloat') {
                style['float'] = currentStyle[property];
            } else {
                style[property] = currentStyle[property];
            }
        }

        setShortStyleProperty(style, 'margin');
        setShortStyleProperty(style, 'padding');
        setShortStyleProperty(style, 'border');

        style.fontSize = fontSize + 'px';

        return style;
    }

    CSSStyleDeclaration.prototype = {
        constructor: CSSStyleDeclaration,
        getPropertyPriority: function() {},
        getPropertyValue: function(prop) {
            return this[prop] || '';
        },
        item: function() {},
        removeProperty: function() {},
        setProperty: function() {},
        getPropertyCSSValue: function() {}
    };

    function getComputedStyle(element) {
        return new CSSStyleDeclaration(element);
    }

    return getComputedStyle;
})(this));


// https://gist.github.com/Daniel-Hug/9221945
//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function(win, doc) {
    if (win.addEventListener) return; //No need to polyfill

    function docHijack(p) {
        var old = doc[p];
        doc[p] = function(v) {
            return addListen(old(v))
        }
    }

    function addEvent(on, fn, self) {
        return (self = this).attachEvent('on' + on, function(e) {
            e = e || win.event;
            e.preventDefault = e.preventDefault || function() {
                e.returnValue = false
            }
            e.stopPropagation = e.stopPropagation || function() {
                e.cancelBubble = true
            }
            fn.call(self, e);
        });
    }

    function addListen(obj, i) {
        if (i = obj.length)
            while (i--) obj[i].addEventListener = addEvent;
        else obj.addEventListener = addEvent;
        return obj;
    }

    addListen([doc, win]);
    if ('Element' in win) win.Element.prototype.addEventListener = addEvent; //IE8
    else { //IE < 8
        doc.attachEvent('onreadystatechange', function() {
            addListen(doc.all)
        }); //Make sure we also init at domReady
        docHijack('getElementsByTagName');
        docHijack('getElementById');
        docHijack('createElement');
        addListen(doc.all);
    }
})(window, document);



// ES5 IE FIXES

// ES5 15.2.3.4 Object.getOwnPropertyNames ( O )
if (typeof Object.getOwnPropertyNames !== "function") {
    Object.getOwnPropertyNames = function(o) {
        if (o !== Object(o)) {
            throw TypeError("Object.getOwnPropertyNames called on non-object");
        }
        var props = [],
            p;
        for (p in o) {
            if (Object.prototype.hasOwnProperty.call(o, p)) {
                props.push(p);
            }
        }
        return props;
    };
};


// ES5 15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {
        if (this === void 0 || this === null) {
            throw TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (isNaN(n)) {
                n = 0;
            } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };
};


//
// ES 15.9.4 Properties of the Date Constructor
//
// ES5 15.9.4.4 Date.now ( )
// From https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/now
if (!Date.now) {
    Date.now = function now() {
        return Number(new Date());
    };
};
