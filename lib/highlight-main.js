/* 
 * @Author: login
 * @Date:   2014-10-23 13:27:55
 * @Last Modified by:   login
 * @Last Modified time: 2014-10-24 09:02:43
 */
var lineHighlight = function(element) {
    var self = this;

    // Reference to parent element ID
    self.elementID = element;
    // Current row of child element
    self.currentIndex = null;

    self.childElements = null;

    self.options = {
        // APPLET, AREA, BGSOUND, EMBED, IMG, MAP, NOEMBED, OBJECT, PARAM, 
        // BUTTON, FIELDSET, FORM, INPUT, ISINDEX, LABEL, LEGEND, OPTGROUP, OPTION, SELECT, TEXTAREA,         
        // FRAME, FRAMESET, NOFRAMES, IFRAME,         
        ignoredEl: ['UL', 'A', 'IMG', 'CANVAS', 'INPUT', 'SELECT', 'TEXTAREA']
    };

    self.element = {
        el: document.querySelector(self.elementID),
        style: null,
        width: null,
        height: null,
        lineHeight: null,
        totalRows: null,
        highlightEl: null,
        top: 0,
        left: 0
    }
    self.mouseEvent = new CustomEvent('mousechange', {
        'x': null,
        'y': null
    });
    // Init on main element
    self.initElementDimensions();
    // Register events
    self.initRootEvents();
    // Register events
    self.initChildEvents();
    // Create placeholder
    self.createHighlightPlaceholder();
    // Check if shortcut is needed??
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

    this.element.highlightEl = document.createElement('div');
    this.element.highlightEl.setAttribute('class', 'highlighter');
    this.element.highlightEl.style.position = 'absolute';

    this.element.el.appendChild(this.element.highlightEl);


};
