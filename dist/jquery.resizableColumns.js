/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Fri Oct 27 2023 12:12:19 GMT+1300 (New Zealand Daylight Time)
 * @version v0.2.3
 * @link http://dobtco.github.io/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
  function ResizableColumns($table, options) {
    _classCallCheck(this, ResizableColumns);

    this.ns = '.rc' + this.count++;

    this.options = $.extend({}, ResizableColumns.defaults, options);

    this.$window = $(window);
    this.$ownerDocument = $($table[0].ownerDocument);
    this.$table = $table;

    this.refreshHeaders();
    this.restoreColumnWidths();
    this.syncHandleWidths();

    this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

    if (this.options.start) {
      this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
    }
    if (this.options.resize) {
      this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
    }
    if (this.options.stop) {
      this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
    }
  }

  /**
  Refreshes the headers associated with this instances <table/> element and
  generates handles for them. Also assigns percentage widths.
   @method refreshHeaders
  **/

  _createClass(ResizableColumns, [{
    key: 'refreshHeaders',
    value: function refreshHeaders() {
      // Allow the selector to be both a regular selctor string as well as
      // a dynamic callback
      var selector = this.options.selector;
      if (typeof selector === 'function') {
        selector = selector.call(this, this.$table);
      }

      // Select all table headers
      this.$tableHeaders = this.$table.find(selector);

      // Assign percentage widths first, then create drag handles
      this.assignPercentageWidths();
      this.createHandles();
    }

    /**
    Creates dummy handle elements for all table header columns
     @method createHandles
    **/
  }, {
    key: 'createHandles',
    value: function createHandles() {
      var _this = this;

      var ref = this.$handleContainer;
      if (ref != null) {
        ref.remove();
      }

      this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
      this.$table.before(this.$handleContainer);

      this.$tableHeaders.each(function (i, el) {
        var $current = _this.$tableHeaders.eq(i);
        var $next = _this.$tableHeaders.eq(i + 1);

        if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
          return;
        }

        var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
      });

      this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
    }

    /**
    Assigns a percentage width to all columns based on their current pixel width(s)
     @method assignPercentageWidths
    **/
  }, {
    key: 'assignPercentageWidths',
    value: function assignPercentageWidths() {
      var _this2 = this;

      this.$tableHeaders.each(function (_, el) {
        var $el = $(el);
        _this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
      });
    }

    /**
      @method syncHandleWidths
    **/
  }, {
    key: 'syncHandleWidths',
    value: function syncHandleWidths() {
      var _this3 = this;

      var $container = this.$handleContainer;

      $container.width(this.$table.width());

      $container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
        var $el = $(el);

        var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

        var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

        $el.css({ left: left, height: height });
      });
    }

    /**
    Persists the column widths in localStorage
     @method saveColumnWidths
    **/
  }, {
    key: 'saveColumnWidths',
    value: function saveColumnWidths() {
      var _this4 = this;

      this.$tableHeaders.each(function (_, el) {
        var $el = $(el);

        if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
          _this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
        }
      });
    }

    /**
    Retrieves and sets the column widths from localStorage
     @method restoreColumnWidths
    **/
  }, {
    key: 'restoreColumnWidths',
    value: function restoreColumnWidths() {
      var _this5 = this;

      this.$tableHeaders.each(function (_, el) {
        var $el = $(el);

        if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
          var width = _this5.options.store.get(_this5.generateColumnId($el));

          if (width != null) {
            _this5.setWidth(el, width);
          }
        }
      });
    }

    /**
    Pointer/mouse down handler
     @method onPointerDown
    @param event {Object} Event object associated with the interaction
    **/
  }, {
    key: 'onPointerDown',
    value: function onPointerDown(event) {
      // Only applies to left-click dragging
      if (event.which !== 1) {
        return;
      }

      // If a previous operation is defined, we missed the last mouseup.
      // Probably gobbled up by user mousing out the window then releasing.
      // We'll simulate a pointerup here prior to it
      if (this.operation) {
        this.onPointerUp(event);
      }

      // Ignore non-resizable columns
      var $currentGrip = $(event.currentTarget);
      if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
        return;
      }

      var gripIndex = $currentGrip.index();
      var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
      var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

      var leftWidth = this.parseWidth($leftColumn[0]);
      var rightWidth = this.parseWidth($rightColumn[0]);

      this.operation = {
        $leftColumn: $leftColumn,
        $rightColumn: $rightColumn,
        $currentGrip: $currentGrip,

        startX: this.getPointerX(event),

        widths: {
          left: leftWidth,
          right: rightWidth
        },
        newWidths: {
          left: leftWidth,
          right: rightWidth
        }
      };

      this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
      this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

      this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

      $leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

      this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

      event.preventDefault();
    }

    /**
    Pointer/mouse movement handler
     @method onPointerMove
    @param event {Object} Event object associated with the interaction
    **/
  }, {
    key: 'onPointerMove',
    value: function onPointerMove(event) {
      var op = this.operation;
      if (!this.operation) {
        return;
      }

      // Determine the delta change between start and new mouse position, as a percentage of the table width
      var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
      if (difference === 0) {
        return;
      }

      var leftColumn = op.$leftColumn[0];
      var rightColumn = op.$rightColumn[0];
      var widthLeft = undefined,
          widthRight = undefined;

      if (difference > 0) {
        widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
        widthRight = this.constrainWidth(op.widths.right - difference);
      } else if (difference < 0) {
        widthLeft = this.constrainWidth(op.widths.left + difference);
        widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
      }

      if (leftColumn) {
        this.setWidth(leftColumn, widthLeft);
      }
      if (rightColumn) {
        this.setWidth(rightColumn, widthRight);
      }

      op.newWidths.left = widthLeft;
      op.newWidths.right = widthRight;

      return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
    }

    /**
    Pointer/mouse release handler
     @method onPointerUp
    @param event {Object} Event object associated with the interaction
    **/
  }, {
    key: 'onPointerUp',
    value: function onPointerUp(event) {
      var op = this.operation;
      if (!this.operation) {
        return;
      }

      this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

      this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

      op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

      this.syncHandleWidths();
      this.saveColumnWidths();

      this.operation = null;

      return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
    }

    /**
    Removes all event listeners, data, and added DOM elements. Takes
    the <table/> element back to how it was, and returns it
     @method destroy
    @return {jQuery} Original jQuery-wrapped <table> element
    **/
  }, {
    key: 'destroy',
    value: function destroy() {
      var $table = this.$table;
      var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

      this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

      $handles.removeData(_constants.DATA_TH);
      $table.removeData(_constants.DATA_API);

      this.$handleContainer.remove();
      this.$handleContainer = null;
      this.$tableHeaders = null;
      this.$table = null;

      return $table;
    }

    /**
    Binds given events for this instance to the given target DOMElement
     @private
    @method bindEvents
    @param target {jQuery} jQuery-wrapped DOMElement to bind events to
    @param events {String|Array} Event name (or array of) to bind
    @param selectorOrCallback {String|Function} Selector string or callback
    @param [callback] {Function} Callback method
    **/
  }, {
    key: 'bindEvents',
    value: function bindEvents($target, events, selectorOrCallback, callback) {
      if (typeof events === 'string') {
        events = events + this.ns;
      } else {
        events = events.join(this.ns + ' ') + this.ns;
      }

      if (arguments.length > 3) {
        $target.on(events, selectorOrCallback, callback);
      } else {
        $target.on(events, selectorOrCallback);
      }
    }

    /**
    Unbinds events specific to this instance from the given target DOMElement
     @private
    @method unbindEvents
    @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
    @param events {String|Array} Event name (or array of) to unbind
    **/
  }, {
    key: 'unbindEvents',
    value: function unbindEvents($target, events) {
      if (typeof events === 'string') {
        events = events + this.ns;
      } else if (events != null) {
        events = events.join(this.ns + ' ') + this.ns;
      } else {
        events = this.ns;
      }

      $target.off(events);
    }

    /**
    Triggers an event on the <table/> element for a given type with given
    arguments, also setting and allowing access to the originalEvent if
    given. Returns the result of the triggered event.
     @private
    @method triggerEvent
    @param type {String} Event name
    @param args {Array} Array of arguments to pass through
    @param [originalEvent] If given, is set on the event object
    @return {Mixed} Result of the event trigger action
    **/
  }, {
    key: 'triggerEvent',
    value: function triggerEvent(type, args, originalEvent) {
      var event = $.Event(type);
      if (event.originalEvent) {
        event.originalEvent = $.extend({}, originalEvent);
      }

      return this.$table.trigger(event, [this].concat(args || []));
    }

    /**
    Calculates a unique column ID for a given column DOMElement
     @private
    @method generateColumnId
    @param $el {jQuery} jQuery-wrapped column element
    @return {String} Column ID
    **/
  }, {
    key: 'generateColumnId',
    value: function generateColumnId($el) {
      return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
    }

    /**
    Parses a given DOMElement's width into a float
     @private
    @method parseWidth
    @param element {DOMElement} Element to get width of
    @return {Number} Element's width as a float
    **/
  }, {
    key: 'parseWidth',
    value: function parseWidth(element) {
      return element ? parseFloat(element.style.width.replace('%', '')) : 0;
    }

    /**
    Sets the percentage width of a given DOMElement
     @private
    @method setWidth
    @param element {DOMElement} Element to set width on
    @param width {Number} Width, as a percentage, to set
    **/
  }, {
    key: 'setWidth',
    value: function setWidth(element, width) {
      width = width.toFixed(2);
      width = width > 0 ? width : 0;
      element.style.width = width + '%';
    }

    /**
    Constrains a given width to the minimum and maximum ranges defined in
    the `minWidth` and `maxWidth` configuration options, respectively.
     @private
    @method constrainWidth
    @param width {Number} Width to constrain
    @return {Number} Constrained width
    **/
  }, {
    key: 'constrainWidth',
    value: function constrainWidth(width) {
      if (this.options.minWidth != undefined) {
        width = Math.max(this.options.minWidth, width);
      }

      if (this.options.maxWidth != undefined) {
        width = Math.min(this.options.maxWidth, width);
      }

      return width;
    }

    /**
    Given a particular Event object, retrieves the current pointer offset along
    the horizontal direction. Accounts for both regular mouse clicks as well as
    pointer-like systems (mobiles, tablets etc.)
     @private
    @method getPointerX
    @param event {Object} Event object associated with the interaction
    @return {Number} Horizontal pointer offset
    **/
  }, {
    key: 'getPointerX',
    value: function getPointerX(event) {
      if (event.type.indexOf('touch') === 0) {
        return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
      }
      return event.pageX;
    }
  }]);

  return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
  selector: function selector($table) {
    if ($table.find('thead').length) {
      return _constants.SELECTOR_TH;
    }

    return _constants.SELECTOR_TD;
  },
  store: window.store,
  syncHandlers: true,
  resizeFromBody: true,
  maxWidth: null,
  minWidth: 0.01
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_TH = 'th';

exports.DATA_TH = DATA_TH;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';
exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0ovQixhQUFhOzs7Ozs7Ozs7OztJQVVDLGdCQUFnQjtBQUN4QixXQURRLGdCQUFnQixDQUN2QixNQUFNLEVBQUUsT0FBTyxFQUFFOzBCQURWLGdCQUFnQjs7QUFFakMsUUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixRQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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bnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuJC5mbi5yZXNpemFibGVDb2x1bW5zID0gZnVuY3Rpb24ob3B0aW9uc09yTWV0aG9kLCAuLi5hcmdzKSB7XG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0bGV0ICR0YWJsZSA9ICQodGhpcyk7XG5cblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xuXHRcdGlmICghYXBpKSB7XG5cdFx0XHRhcGkgPSBuZXcgUmVzaXphYmxlQ29sdW1ucygkdGFibGUsIG9wdGlvbnNPck1ldGhvZCk7XG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcblx0XHR9XG5cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGFwaVtvcHRpb25zT3JNZXRob2RdKC4uLmFyZ3MpO1xuXHRcdH1cblx0fSk7XG59O1xuXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xuIiwiaW1wb3J0IHtcbiAgREFUQV9BUEksXG4gIERBVEFfQ09MVU1OU19JRCxcbiAgREFUQV9DT0xVTU5fSUQsXG4gIERBVEFfVEgsXG4gIENMQVNTX1RBQkxFX1JFU0laSU5HLFxuICBDTEFTU19DT0xVTU5fUkVTSVpJTkcsXG4gIENMQVNTX0hBTkRMRSxcbiAgQ0xBU1NfSEFORExFX0NPTlRBSU5FUixcbiAgRVZFTlRfUkVTSVpFX1NUQVJULFxuICBFVkVOVF9SRVNJWkUsXG4gIEVWRU5UX1JFU0laRV9TVE9QLFxuICBTRUxFQ1RPUl9USCxcbiAgU0VMRUNUT1JfVEQsXG4gIFNFTEVDVE9SX1VOUkVTSVpBQkxFLFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuVGFrZXMgYSA8dGFibGUgLz4gZWxlbWVudCBhbmQgbWFrZXMgaXQncyBjb2x1bW5zIHJlc2l6YWJsZSBhY3Jvc3MgYm90aFxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXG5cbkBjbGFzcyBSZXNpemFibGVDb2x1bW5zXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxuQHBhcmFtIG9wdGlvbnMge09iamVjdH0gQ29uZmlndXJhdGlvbiBvYmplY3RcbioqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XG4gIGNvbnN0cnVjdG9yKCR0YWJsZSwgb3B0aW9ucykge1xuICAgIHRoaXMubnMgPSAnLnJjJyArIHRoaXMuY291bnQrKztcblxuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBSZXNpemFibGVDb2x1bW5zLmRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcbiAgICB0aGlzLiRvd25lckRvY3VtZW50ID0gJCgkdGFibGVbMF0ub3duZXJEb2N1bWVudCk7XG4gICAgdGhpcy4kdGFibGUgPSAkdGFibGU7XG5cbiAgICB0aGlzLnJlZnJlc2hIZWFkZXJzKCk7XG4gICAgdGhpcy5yZXN0b3JlQ29sdW1uV2lkdGhzKCk7XG4gICAgdGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XG5cbiAgICB0aGlzLmJpbmRFdmVudHModGhpcy4kd2luZG93LCAncmVzaXplJywgdGhpcy5zeW5jSGFuZGxlV2lkdGhzLmJpbmQodGhpcykpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5zdGFydCkge1xuICAgICAgdGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RBUlQsIHRoaXMub3B0aW9ucy5zdGFydCk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVzaXplKSB7XG4gICAgICB0aGlzLmJpbmRFdmVudHModGhpcy4kdGFibGUsIEVWRU5UX1JFU0laRSwgdGhpcy5vcHRpb25zLnJlc2l6ZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3RvcCkge1xuICAgICAgdGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkVfU1RPUCwgdGhpcy5vcHRpb25zLnN0b3ApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICBSZWZyZXNoZXMgdGhlIGhlYWRlcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgaW5zdGFuY2VzIDx0YWJsZS8+IGVsZW1lbnQgYW5kXG4gIGdlbmVyYXRlcyBoYW5kbGVzIGZvciB0aGVtLiBBbHNvIGFzc2lnbnMgcGVyY2VudGFnZSB3aWR0aHMuXG5cbiAgQG1ldGhvZCByZWZyZXNoSGVhZGVyc1xuICAqKi9cbiAgcmVmcmVzaEhlYWRlcnMoKSB7XG4gICAgLy8gQWxsb3cgdGhlIHNlbGVjdG9yIHRvIGJlIGJvdGggYSByZWd1bGFyIHNlbGN0b3Igc3RyaW5nIGFzIHdlbGwgYXNcbiAgICAvLyBhIGR5bmFtaWMgY2FsbGJhY2tcbiAgICBsZXQgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XG4gICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgc2VsZWN0b3IgPSBzZWxlY3Rvci5jYWxsKHRoaXMsIHRoaXMuJHRhYmxlKTtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgYWxsIHRhYmxlIGhlYWRlcnNcbiAgICB0aGlzLiR0YWJsZUhlYWRlcnMgPSB0aGlzLiR0YWJsZS5maW5kKHNlbGVjdG9yKTtcblxuICAgIC8vIEFzc2lnbiBwZXJjZW50YWdlIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXG4gICAgdGhpcy5hc3NpZ25QZXJjZW50YWdlV2lkdGhzKCk7XG4gICAgdGhpcy5jcmVhdGVIYW5kbGVzKCk7XG4gIH1cblxuICAvKipcbiAgQ3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xuXG4gIEBtZXRob2QgY3JlYXRlSGFuZGxlc1xuICAqKi9cbiAgY3JlYXRlSGFuZGxlcygpIHtcbiAgICBsZXQgcmVmID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xuICAgIGlmIChyZWYgIT0gbnVsbCkge1xuICAgICAgcmVmLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuJGhhbmRsZUNvbnRhaW5lciA9ICQoYDxkaXYgY2xhc3M9JyR7Q0xBU1NfSEFORExFX0NPTlRBSU5FUn0nIC8+YCk7XG4gICAgdGhpcy4kdGFibGUuYmVmb3JlKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XG5cbiAgICB0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCAkY3VycmVudCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpKTtcbiAgICAgIGxldCAkbmV4dCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpICsgMSk7XG5cbiAgICAgIGlmIChcbiAgICAgICAgJG5leHQubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICRjdXJyZW50LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSB8fFxuICAgICAgICAkbmV4dC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCAkaGFuZGxlID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEV9JyAvPmApXG4gICAgICAgIC5kYXRhKERBVEFfVEgsICQoZWwpKVxuICAgICAgICAuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcbiAgICB9KTtcblxuICAgIHRoaXMuYmluZEV2ZW50cyhcbiAgICAgIHRoaXMuJGhhbmRsZUNvbnRhaW5lcixcbiAgICAgIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSxcbiAgICAgICcuJyArIENMQVNTX0hBTkRMRSxcbiAgICAgIHRoaXMub25Qb2ludGVyRG93bi5iaW5kKHRoaXMpLFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgQXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxuXG4gIEBtZXRob2QgYXNzaWduUGVyY2VudGFnZVdpZHRoc1xuICAqKi9cbiAgYXNzaWduUGVyY2VudGFnZVdpZHRocygpIHtcbiAgICB0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcbiAgICAgIGxldCAkZWwgPSAkKGVsKTtcbiAgICAgIHRoaXMuc2V0V2lkdGgoJGVsWzBdLCAoJGVsLm91dGVyV2lkdGgoKSAvIHRoaXMuJHRhYmxlLndpZHRoKCkpICogMTAwKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuXG5cbiAgQG1ldGhvZCBzeW5jSGFuZGxlV2lkdGhzXG4gICoqL1xuICBzeW5jSGFuZGxlV2lkdGhzKCkge1xuICAgIGxldCAkY29udGFpbmVyID0gdGhpcy4kaGFuZGxlQ29udGFpbmVyO1xuXG4gICAgJGNvbnRhaW5lci53aWR0aCh0aGlzLiR0YWJsZS53aWR0aCgpKTtcblxuICAgICRjb250YWluZXIuZmluZCgnLicgKyBDTEFTU19IQU5ETEUpLmVhY2goKF8sIGVsKSA9PiB7XG4gICAgICBsZXQgJGVsID0gJChlbCk7XG5cbiAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMucmVzaXplRnJvbUJvZHlcbiAgICAgICAgPyB0aGlzLiR0YWJsZS5oZWlnaHQoKVxuICAgICAgICA6IHRoaXMuJHRhYmxlLmZpbmQoJ3RoZWFkJykuaGVpZ2h0KCk7XG5cbiAgICAgIGxldCBsZWZ0ID1cbiAgICAgICAgJGVsLmRhdGEoREFUQV9USCkub3V0ZXJXaWR0aCgpICtcbiAgICAgICAgKCRlbC5kYXRhKERBVEFfVEgpLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdCk7XG5cbiAgICAgICRlbC5jc3MoeyBsZWZ0LCBoZWlnaHQgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgUGVyc2lzdHMgdGhlIGNvbHVtbiB3aWR0aHMgaW4gbG9jYWxTdG9yYWdlXG5cbiAgQG1ldGhvZCBzYXZlQ29sdW1uV2lkdGhzXG4gICoqL1xuICBzYXZlQ29sdW1uV2lkdGhzKCkge1xuICAgIHRoaXMuJHRhYmxlSGVhZGVycy5lYWNoKChfLCBlbCkgPT4ge1xuICAgICAgbGV0ICRlbCA9ICQoZWwpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnN0b3JlICYmICEkZWwuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5zdG9yZS5zZXQodGhpcy5nZW5lcmF0ZUNvbHVtbklkKCRlbCksIHRoaXMucGFyc2VXaWR0aChlbCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gIFJldHJpZXZlcyBhbmQgc2V0cyB0aGUgY29sdW1uIHdpZHRocyBmcm9tIGxvY2FsU3RvcmFnZVxuXG4gIEBtZXRob2QgcmVzdG9yZUNvbHVtbldpZHRoc1xuICAqKi9cbiAgcmVzdG9yZUNvbHVtbldpZHRocygpIHtcbiAgICB0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcbiAgICAgIGxldCAkZWwgPSAkKGVsKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm9wdGlvbnMuc3RvcmUuZ2V0KHRoaXMuZ2VuZXJhdGVDb2x1bW5JZCgkZWwpKTtcblxuICAgICAgICBpZiAod2lkdGggIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gIFBvaW50ZXIvbW91c2UgZG93biBoYW5kbGVyXG5cbiAgQG1ldGhvZCBvblBvaW50ZXJEb3duXG4gIEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxuICAqKi9cbiAgb25Qb2ludGVyRG93bihldmVudCkge1xuICAgIC8vIE9ubHkgYXBwbGllcyB0byBsZWZ0LWNsaWNrIGRyYWdnaW5nXG4gICAgaWYgKGV2ZW50LndoaWNoICE9PSAxKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSBwcmV2aW91cyBvcGVyYXRpb24gaXMgZGVmaW5lZCwgd2UgbWlzc2VkIHRoZSBsYXN0IG1vdXNldXAuXG4gICAgLy8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXG4gICAgLy8gV2UnbGwgc2ltdWxhdGUgYSBwb2ludGVydXAgaGVyZSBwcmlvciB0byBpdFxuICAgIGlmICh0aGlzLm9wZXJhdGlvbikge1xuICAgICAgdGhpcy5vblBvaW50ZXJVcChldmVudCk7XG4gICAgfVxuXG4gICAgLy8gSWdub3JlIG5vbi1yZXNpemFibGUgY29sdW1uc1xuICAgIGxldCAkY3VycmVudEdyaXAgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgIGlmICgkY3VycmVudEdyaXAuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGdyaXBJbmRleCA9ICRjdXJyZW50R3JpcC5pbmRleCgpO1xuICAgIGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVyc1xuICAgICAgLmVxKGdyaXBJbmRleClcbiAgICAgIC5ub3QoU0VMRUNUT1JfVU5SRVNJWkFCTEUpO1xuICAgIGxldCAkcmlnaHRDb2x1bW4gPSB0aGlzLiR0YWJsZUhlYWRlcnNcbiAgICAgIC5lcShncmlwSW5kZXggKyAxKVxuICAgICAgLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XG5cbiAgICBsZXQgbGVmdFdpZHRoID0gdGhpcy5wYXJzZVdpZHRoKCRsZWZ0Q29sdW1uWzBdKTtcbiAgICBsZXQgcmlnaHRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkcmlnaHRDb2x1bW5bMF0pO1xuXG4gICAgdGhpcy5vcGVyYXRpb24gPSB7XG4gICAgICAkbGVmdENvbHVtbixcbiAgICAgICRyaWdodENvbHVtbixcbiAgICAgICRjdXJyZW50R3JpcCxcblxuICAgICAgc3RhcnRYOiB0aGlzLmdldFBvaW50ZXJYKGV2ZW50KSxcblxuICAgICAgd2lkdGhzOiB7XG4gICAgICAgIGxlZnQ6IGxlZnRXaWR0aCxcbiAgICAgICAgcmlnaHQ6IHJpZ2h0V2lkdGgsXG4gICAgICB9LFxuICAgICAgbmV3V2lkdGhzOiB7XG4gICAgICAgIGxlZnQ6IGxlZnRXaWR0aCxcbiAgICAgICAgcmlnaHQ6IHJpZ2h0V2lkdGgsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICB0aGlzLmJpbmRFdmVudHMoXG4gICAgICB0aGlzLiRvd25lckRvY3VtZW50LFxuICAgICAgWydtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10sXG4gICAgICB0aGlzLm9uUG9pbnRlck1vdmUuYmluZCh0aGlzKSxcbiAgICApO1xuICAgIHRoaXMuYmluZEV2ZW50cyhcbiAgICAgIHRoaXMuJG93bmVyRG9jdW1lbnQsXG4gICAgICBbJ21vdXNldXAnLCAndG91Y2hlbmQnXSxcbiAgICAgIHRoaXMub25Qb2ludGVyVXAuYmluZCh0aGlzKSxcbiAgICApO1xuXG4gICAgdGhpcy4kaGFuZGxlQ29udGFpbmVyLmFkZCh0aGlzLiR0YWJsZSkuYWRkQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xuXG4gICAgJGxlZnRDb2x1bW5cbiAgICAgIC5hZGQoJHJpZ2h0Q29sdW1uKVxuICAgICAgLmFkZCgkY3VycmVudEdyaXApXG4gICAgICAuYWRkQ2xhc3MoQ0xBU1NfQ09MVU1OX1JFU0laSU5HKTtcblxuICAgIHRoaXMudHJpZ2dlckV2ZW50KFxuICAgICAgRVZFTlRfUkVTSVpFX1NUQVJULFxuICAgICAgWyRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sIGxlZnRXaWR0aCwgcmlnaHRXaWR0aF0sXG4gICAgICBldmVudCxcbiAgICApO1xuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuXG4gIC8qKlxuICBQb2ludGVyL21vdXNlIG1vdmVtZW50IGhhbmRsZXJcblxuICBAbWV0aG9kIG9uUG9pbnRlck1vdmVcbiAgQHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG4gICoqL1xuICBvblBvaW50ZXJNb3ZlKGV2ZW50KSB7XG4gICAgbGV0IG9wID0gdGhpcy5vcGVyYXRpb247XG4gICAgaWYgKCF0aGlzLm9wZXJhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSB0aGUgZGVsdGEgY2hhbmdlIGJldHdlZW4gc3RhcnQgYW5kIG5ldyBtb3VzZSBwb3NpdGlvbiwgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0YWJsZSB3aWR0aFxuICAgIGxldCBkaWZmZXJlbmNlID1cbiAgICAgICgodGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSkgKiAxMDA7XG4gICAgaWYgKGRpZmZlcmVuY2UgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGVmdENvbHVtbiA9IG9wLiRsZWZ0Q29sdW1uWzBdO1xuICAgIGxldCByaWdodENvbHVtbiA9IG9wLiRyaWdodENvbHVtblswXTtcbiAgICBsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0O1xuXG4gICAgaWYgKGRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICB3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKFxuICAgICAgICBvcC53aWR0aHMubGVmdCArIChvcC53aWR0aHMucmlnaHQgLSBvcC5uZXdXaWR0aHMucmlnaHQpLFxuICAgICAgKTtcbiAgICAgIHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xuICAgIH0gZWxzZSBpZiAoZGlmZmVyZW5jZSA8IDApIHtcbiAgICAgIHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLmxlZnQgKyBkaWZmZXJlbmNlKTtcbiAgICAgIHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKFxuICAgICAgICBvcC53aWR0aHMucmlnaHQgKyAob3Aud2lkdGhzLmxlZnQgLSBvcC5uZXdXaWR0aHMubGVmdCksXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChsZWZ0Q29sdW1uKSB7XG4gICAgICB0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XG4gICAgfVxuICAgIGlmIChyaWdodENvbHVtbikge1xuICAgICAgdGhpcy5zZXRXaWR0aChyaWdodENvbHVtbiwgd2lkdGhSaWdodCk7XG4gICAgfVxuXG4gICAgb3AubmV3V2lkdGhzLmxlZnQgPSB3aWR0aExlZnQ7XG4gICAgb3AubmV3V2lkdGhzLnJpZ2h0ID0gd2lkdGhSaWdodDtcblxuICAgIHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChcbiAgICAgIEVWRU5UX1JFU0laRSxcbiAgICAgIFtvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLCB3aWR0aExlZnQsIHdpZHRoUmlnaHRdLFxuICAgICAgZXZlbnQsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICBQb2ludGVyL21vdXNlIHJlbGVhc2UgaGFuZGxlclxuXG4gIEBtZXRob2Qgb25Qb2ludGVyVXBcbiAgQHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG4gICoqL1xuICBvblBvaW50ZXJVcChldmVudCkge1xuICAgIGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xuICAgIGlmICghdGhpcy5vcGVyYXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnVuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbXG4gICAgICAnbW91c2V1cCcsXG4gICAgICAndG91Y2hlbmQnLFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICAndG91Y2htb3ZlJyxcbiAgICBdKTtcblxuICAgIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5hZGQodGhpcy4kdGFibGUpLnJlbW92ZUNsYXNzKENMQVNTX1RBQkxFX1JFU0laSU5HKTtcblxuICAgIG9wLiRsZWZ0Q29sdW1uXG4gICAgICAuYWRkKG9wLiRyaWdodENvbHVtbilcbiAgICAgIC5hZGQob3AuJGN1cnJlbnRHcmlwKVxuICAgICAgLnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XG5cbiAgICB0aGlzLnN5bmNIYW5kbGVXaWR0aHMoKTtcbiAgICB0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcblxuICAgIHRoaXMub3BlcmF0aW9uID0gbnVsbDtcblxuICAgIHJldHVybiB0aGlzLnRyaWdnZXJFdmVudChcbiAgICAgIEVWRU5UX1JFU0laRV9TVE9QLFxuICAgICAgW29wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sIG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRdLFxuICAgICAgZXZlbnQsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICBSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXG4gIHRoZSA8dGFibGUvPiBlbGVtZW50IGJhY2sgdG8gaG93IGl0IHdhcywgYW5kIHJldHVybnMgaXRcblxuICBAbWV0aG9kIGRlc3Ryb3lcbiAgQHJldHVybiB7alF1ZXJ5fSBPcmlnaW5hbCBqUXVlcnktd3JhcHBlZCA8dGFibGU+IGVsZW1lbnRcbiAgKiovXG4gIGRlc3Ryb3koKSB7XG4gICAgbGV0ICR0YWJsZSA9IHRoaXMuJHRhYmxlO1xuICAgIGxldCAkaGFuZGxlcyA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lci5maW5kKCcuJyArIENMQVNTX0hBTkRMRSk7XG5cbiAgICB0aGlzLnVuYmluZEV2ZW50cyhcbiAgICAgIHRoaXMuJHdpbmRvdy5hZGQodGhpcy4kb3duZXJEb2N1bWVudCkuYWRkKHRoaXMuJHRhYmxlKS5hZGQoJGhhbmRsZXMpLFxuICAgICk7XG5cbiAgICAkaGFuZGxlcy5yZW1vdmVEYXRhKERBVEFfVEgpO1xuICAgICR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcblxuICAgIHRoaXMuJGhhbmRsZUNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICB0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xuICAgIHRoaXMuJHRhYmxlSGVhZGVycyA9IG51bGw7XG4gICAgdGhpcy4kdGFibGUgPSBudWxsO1xuXG4gICAgcmV0dXJuICR0YWJsZTtcbiAgfVxuXG4gIC8qKlxuICBCaW5kcyBnaXZlbiBldmVudHMgZm9yIHRoaXMgaW5zdGFuY2UgdG8gdGhlIGdpdmVuIHRhcmdldCBET01FbGVtZW50XG5cbiAgQHByaXZhdGVcbiAgQG1ldGhvZCBiaW5kRXZlbnRzXG4gIEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xuICBAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byBiaW5kXG4gIEBwYXJhbSBzZWxlY3Rvck9yQ2FsbGJhY2sge1N0cmluZ3xGdW5jdGlvbn0gU2VsZWN0b3Igc3RyaW5nIG9yIGNhbGxiYWNrXG4gIEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXG4gICoqL1xuICBiaW5kRXZlbnRzKCR0YXJnZXQsIGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrLCBjYWxsYmFjaykge1xuICAgIGlmICh0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xuICAgICAgZXZlbnRzID0gZXZlbnRzICsgdGhpcy5ucztcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgJHRhcmdldC5vbihldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICAkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgVW5iaW5kcyBldmVudHMgc3BlY2lmaWMgdG8gdGhpcyBpbnN0YW5jZSBmcm9tIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxuXG4gIEBwcml2YXRlXG4gIEBtZXRob2QgdW5iaW5kRXZlbnRzXG4gIEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cbiAgQHBhcmFtIGV2ZW50cyB7U3RyaW5nfEFycmF5fSBFdmVudCBuYW1lIChvciBhcnJheSBvZikgdG8gdW5iaW5kXG4gICoqL1xuICB1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XG4gICAgaWYgKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xuICAgIH0gZWxzZSBpZiAoZXZlbnRzICE9IG51bGwpIHtcbiAgICAgIGV2ZW50cyA9IGV2ZW50cy5qb2luKHRoaXMubnMgKyAnICcpICsgdGhpcy5ucztcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRzID0gdGhpcy5ucztcbiAgICB9XG5cbiAgICAkdGFyZ2V0Lm9mZihldmVudHMpO1xuICB9XG5cbiAgLyoqXG4gIFRyaWdnZXJzIGFuIGV2ZW50IG9uIHRoZSA8dGFibGUvPiBlbGVtZW50IGZvciBhIGdpdmVuIHR5cGUgd2l0aCBnaXZlblxuICBhcmd1bWVudHMsIGFsc28gc2V0dGluZyBhbmQgYWxsb3dpbmcgYWNjZXNzIHRvIHRoZSBvcmlnaW5hbEV2ZW50IGlmXG4gIGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cblxuICBAcHJpdmF0ZVxuICBAbWV0aG9kIHRyaWdnZXJFdmVudFxuICBAcGFyYW0gdHlwZSB7U3RyaW5nfSBFdmVudCBuYW1lXG4gIEBwYXJhbSBhcmdzIHtBcnJheX0gQXJyYXkgb2YgYXJndW1lbnRzIHRvIHBhc3MgdGhyb3VnaFxuICBAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxuICBAcmV0dXJuIHtNaXhlZH0gUmVzdWx0IG9mIHRoZSBldmVudCB0cmlnZ2VyIGFjdGlvblxuICAqKi9cbiAgdHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcbiAgICBsZXQgZXZlbnQgPSAkLkV2ZW50KHR5cGUpO1xuICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50KSB7XG4gICAgICBldmVudC5vcmlnaW5hbEV2ZW50ID0gJC5leHRlbmQoe30sIG9yaWdpbmFsRXZlbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLiR0YWJsZS50cmlnZ2VyKGV2ZW50LCBbdGhpc10uY29uY2F0KGFyZ3MgfHwgW10pKTtcbiAgfVxuXG4gIC8qKlxuICBDYWxjdWxhdGVzIGEgdW5pcXVlIGNvbHVtbiBJRCBmb3IgYSBnaXZlbiBjb2x1bW4gRE9NRWxlbWVudFxuXG4gIEBwcml2YXRlXG4gIEBtZXRob2QgZ2VuZXJhdGVDb2x1bW5JZFxuICBAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XG4gIEByZXR1cm4ge1N0cmluZ30gQ29sdW1uIElEXG4gICoqL1xuICBnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xuICAgIHJldHVybiB0aGlzLiR0YWJsZS5kYXRhKERBVEFfQ09MVU1OU19JRCkgKyAnLScgKyAkZWwuZGF0YShEQVRBX0NPTFVNTl9JRCk7XG4gIH1cblxuICAvKipcbiAgUGFyc2VzIGEgZ2l2ZW4gRE9NRWxlbWVudCdzIHdpZHRoIGludG8gYSBmbG9hdFxuXG4gIEBwcml2YXRlXG4gIEBtZXRob2QgcGFyc2VXaWR0aFxuICBAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2ZcbiAgQHJldHVybiB7TnVtYmVyfSBFbGVtZW50J3Mgd2lkdGggYXMgYSBmbG9hdFxuICAqKi9cbiAgcGFyc2VXaWR0aChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQgPyBwYXJzZUZsb2F0KGVsZW1lbnQuc3R5bGUud2lkdGgucmVwbGFjZSgnJScsICcnKSkgOiAwO1xuICB9XG5cbiAgLyoqXG4gIFNldHMgdGhlIHBlcmNlbnRhZ2Ugd2lkdGggb2YgYSBnaXZlbiBET01FbGVtZW50XG5cbiAgQHByaXZhdGVcbiAgQG1ldGhvZCBzZXRXaWR0aFxuICBAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cbiAgQHBhcmFtIHdpZHRoIHtOdW1iZXJ9IFdpZHRoLCBhcyBhIHBlcmNlbnRhZ2UsIHRvIHNldFxuICAqKi9cbiAgc2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcbiAgICB3aWR0aCA9IHdpZHRoLnRvRml4ZWQoMik7XG4gICAgd2lkdGggPSB3aWR0aCA+IDAgPyB3aWR0aCA6IDA7XG4gICAgZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJyUnO1xuICB9XG5cbiAgLyoqXG4gIENvbnN0cmFpbnMgYSBnaXZlbiB3aWR0aCB0byB0aGUgbWluaW11bSBhbmQgbWF4aW11bSByYW5nZXMgZGVmaW5lZCBpblxuICB0aGUgYG1pbldpZHRoYCBhbmQgYG1heFdpZHRoYCBjb25maWd1cmF0aW9uIG9wdGlvbnMsIHJlc3BlY3RpdmVseS5cblxuICBAcHJpdmF0ZVxuICBAbWV0aG9kIGNvbnN0cmFpbldpZHRoXG4gIEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cbiAgQHJldHVybiB7TnVtYmVyfSBDb25zdHJhaW5lZCB3aWR0aFxuICAqKi9cbiAgY29uc3RyYWluV2lkdGgod2lkdGgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLm1pbldpZHRoICE9IHVuZGVmaW5lZCkge1xuICAgICAgd2lkdGggPSBNYXRoLm1heCh0aGlzLm9wdGlvbnMubWluV2lkdGgsIHdpZHRoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLm1heFdpZHRoICE9IHVuZGVmaW5lZCkge1xuICAgICAgd2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd2lkdGg7XG4gIH1cblxuICAvKipcbiAgR2l2ZW4gYSBwYXJ0aWN1bGFyIEV2ZW50IG9iamVjdCwgcmV0cmlldmVzIHRoZSBjdXJyZW50IHBvaW50ZXIgb2Zmc2V0IGFsb25nXG4gIHRoZSBob3Jpem9udGFsIGRpcmVjdGlvbi4gQWNjb3VudHMgZm9yIGJvdGggcmVndWxhciBtb3VzZSBjbGlja3MgYXMgd2VsbCBhc1xuICBwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxuXG4gIEBwcml2YXRlXG4gIEBtZXRob2QgZ2V0UG9pbnRlclhcbiAgQHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXG4gIEByZXR1cm4ge051bWJlcn0gSG9yaXpvbnRhbCBwb2ludGVyIG9mZnNldFxuICAqKi9cbiAgZ2V0UG9pbnRlclgoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQudHlwZS5pbmRleE9mKCd0b3VjaCcpID09PSAwKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlc1swXVxuICAgICAgKS5wYWdlWDtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50LnBhZ2VYO1xuICB9XG59XG5cblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XG4gIHNlbGVjdG9yOiBmdW5jdGlvbiAoJHRhYmxlKSB7XG4gICAgaWYgKCR0YWJsZS5maW5kKCd0aGVhZCcpLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFNFTEVDVE9SX1RIO1xuICAgIH1cblxuICAgIHJldHVybiBTRUxFQ1RPUl9URDtcbiAgfSxcbiAgc3RvcmU6IHdpbmRvdy5zdG9yZSxcbiAgc3luY0hhbmRsZXJzOiB0cnVlLFxuICByZXNpemVGcm9tQm9keTogdHJ1ZSxcbiAgbWF4V2lkdGg6IG51bGwsXG4gIG1pbldpZHRoOiAwLjAxLFxufTtcblxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XG4iLCJleHBvcnQgY29uc3QgREFUQV9BUEkgPSAncmVzaXphYmxlQ29sdW1ucyc7XG5leHBvcnQgY29uc3QgREFUQV9DT0xVTU5TX0lEID0gJ3Jlc2l6YWJsZS1jb2x1bW5zLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcbmV4cG9ydCBjb25zdCBEQVRBX1RIID0gJ3RoJztcblxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19DT0xVTU5fUkVTSVpJTkcgPSAncmMtY29sdW1uLXJlc2l6aW5nJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEUgPSAncmMtaGFuZGxlJztcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xuXG5leHBvcnQgY29uc3QgRVZFTlRfUkVTSVpFX1NUQVJUID0gJ2NvbHVtbjpyZXNpemU6c3RhcnQnO1xuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcbmV4cG9ydCBjb25zdCBFVkVOVF9SRVNJWkVfU1RPUCA9ICdjb2x1bW46cmVzaXplOnN0b3AnO1xuXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9URCA9ICd0cjpmaXJzdCA+IHRkOnZpc2libGUnO1xuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1VOUkVTSVpBQkxFID0gYFtkYXRhLW5vcmVzaXplXWA7XG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcbmltcG9ydCBhZGFwdGVyIGZyb20gJy4vYWRhcHRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il0sInByZUV4aXN0aW5nQ29tbWVudCI6Ii8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlMWEJoWTJzdlgzQnlaV3gxWkdVdWFuTWlMQ0l2VlhObGNuTXZjM1JsZG1VdmRtVnljMmx2YmkxamIyNTBjbTlzTDJOdmJHeHZjWFZwWVd3dmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OWhaR0Z3ZEdWeUxtcHpJaXdpTDFWelpYSnpMM04wWlhabEwzWmxjbk5wYjI0dFkyOXVkSEp2YkM5amIyeHNiM0YxYVdGc0wycHhkV1Z5ZVMxeVpYTnBlbUZpYkdVdFkyOXNkVzF1Y3k5emNtTXZZMnhoYzNNdWFuTWlMQ0l2VlhObGNuTXZjM1JsZG1VdmRtVnljMmx2YmkxamIyNTBjbTlzTDJOdmJHeHZjWFZwWVd3dmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OWpiMjV6ZEdGdWRITXVhbk1pTENJdlZYTmxjbk12YzNSbGRtVXZkbVZ5YzJsdmJpMWpiMjUwY205c0wyTnZiR3h2Y1hWcFlXd3ZhbkYxWlhKNUxYSmxjMmw2WVdKc1pTMWpiMngxYlc1ekwzTnlZeTlwYm1SbGVDNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lRVUZCUVRzN096czdjVUpEUVRaQ0xGTkJRVk03T3pzN2VVSkJRMllzWVVGQllUczdRVUZGY0VNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eG5Ra0ZCWjBJc1IwRkJSeXhWUVVGVExHVkJRV1VzUlVGQlZ6dHRRMEZCVGl4SlFVRkpPMEZCUVVvc1RVRkJTVHM3TzBGQlEzaEVMRkZCUVU4c1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eFpRVUZYTzBGQlF6TkNMRTFCUVVrc1RVRkJUU3hIUVVGSExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXpzN1FVRkZja0lzVFVGQlNTeEhRVUZITEVkQlFVY3NUVUZCVFN4RFFVRkRMRWxCUVVrc2NVSkJRVlVzUTBGQlF6dEJRVU5vUXl4TlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRk8wRkJRMVFzVFVGQlJ5eEhRVUZITEhWQ1FVRnhRaXhOUVVGTkxFVkJRVVVzWlVGQlpTeERRVUZETEVOQlFVTTdRVUZEY0VRc1UwRkJUU3hEUVVGRExFbEJRVWtzYzBKQlFWY3NSMEZCUnl4RFFVRkRMRU5CUVVNN1IwRkRNMElzVFVGRlNTeEpRVUZKTEU5QlFVOHNaVUZCWlN4TFFVRkxMRkZCUVZFc1JVRkJSVHM3TzBGQlF6ZERMRlZCUVU4c1VVRkJRU3hIUVVGSExFVkJRVU1zWlVGQlpTeFBRVUZETEU5QlFVa3NTVUZCU1N4RFFVRkRMRU5CUVVNN1IwRkRja003UlVGRFJDeERRVUZETEVOQlFVTTdRMEZEU0N4RFFVRkRPenRCUVVWR0xFTkJRVU1zUTBGQlF5eG5Ra0ZCWjBJc2NVSkJRVzFDTEVOQlFVTTdPenM3T3pzN096czdPenM3ZVVKRFNpOUNMR0ZCUVdFN096czdPenM3T3pzN08wbEJWVU1zWjBKQlFXZENPMEZCUTNoQ0xGZEJSRkVzWjBKQlFXZENMRU5CUTNaQ0xFMUJRVTBzUlVGQlJTeFBRVUZQTEVWQlFVVTdNRUpCUkZZc1owSkJRV2RDT3p0QlFVVnFReXhSUVVGSkxFTkJRVU1zUlVGQlJTeEhRVUZITEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFTkJRVU03TzBGQlJTOUNMRkZCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZMRVZCUVVVc1owSkJRV2RDTEVOQlFVTXNVVUZCVVN4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE96dEJRVVZvUlN4UlFVRkpMRU5CUVVNc1QwRkJUeXhIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0QlFVTjZRaXhSUVVGSkxFTkJRVU1zWTBGQll5eEhRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTTdRVUZEYWtRc1VVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTTdPMEZCUlhKQ0xGRkJRVWtzUTBGQlF5eGpRVUZqTEVWQlFVVXNRMEZCUXp0QlFVTjBRaXhSUVVGSkxFTkJRVU1zYlVKQlFXMUNMRVZCUVVVc1EwRkJRenRCUVVNelFpeFJRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF6czdRVUZGZUVJc1VVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkZMRkZCUVZFc1JVRkJSU3hKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTTdPMEZCUlRGRkxGRkJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVN1FVRkRkRUlzVlVGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hwUTBGQmMwSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dExRVU4wUlR0QlFVTkVMRkZCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eE5RVUZOTEVWQlFVVTdRVUZEZGtJc1ZVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN3eVFrRkJaMElzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRMUVVOcVJUdEJRVU5FTEZGQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFVkJRVVU3UVVGRGNrSXNWVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeG5RMEZCY1VJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0TFFVTndSVHRIUVVOR096czdPenM3T3p0bFFYcENhMElzWjBKQlFXZENPenRYUVdsRGNrSXNNRUpCUVVjN096dEJRVWRtTEZWQlFVa3NVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeERRVUZETzBGQlEzSkRMRlZCUVVrc1QwRkJUeXhSUVVGUkxFdEJRVXNzVlVGQlZTeEZRVUZGTzBGQlEyeERMR2RDUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzA5QlF6ZERPenM3UVVGSFJDeFZRVUZKTEVOQlFVTXNZVUZCWVN4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRPenM3UVVGSGFFUXNWVUZCU1N4RFFVRkRMSE5DUVVGelFpeEZRVUZGTEVOQlFVTTdRVUZET1VJc1ZVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJTeERRVUZETzB0QlEzUkNPenM3T3pzN096dFhRVTlaTEhsQ1FVRkhPenM3UVVGRFpDeFZRVUZKTEVkQlFVY3NSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTTdRVUZEYUVNc1ZVRkJTU3hIUVVGSExFbEJRVWtzU1VGQlNTeEZRVUZGTzBGQlEyWXNWMEZCUnl4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRE8wOUJRMlE3TzBGQlJVUXNWVUZCU1N4RFFVRkRMR2RDUVVGblFpeEhRVUZITEVOQlFVTXNLMFJCUVRaRExFTkJRVU03UVVGRGRrVXNWVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFTkJRVU03TzBGQlJURkRMRlZCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJTenRCUVVOcVF5eFpRVUZKTEZGQlFWRXNSMEZCUnl4TlFVRkxMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEZUVNc1dVRkJTU3hMUVVGTExFZEJRVWNzVFVGQlN5eGhRVUZoTEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6czdRVUZGZWtNc1dVRkRSU3hMUVVGTExFTkJRVU1zVFVGQlRTeExRVUZMTEVOQlFVTXNTVUZEYkVJc1VVRkJVU3hEUVVGRExFVkJRVVVzYVVOQlFYTkNMRWxCUTJwRExFdEJRVXNzUTBGQlF5eEZRVUZGTEdsRFFVRnpRaXhGUVVNNVFqdEJRVU5CTEdsQ1FVRlBPMU5CUTFJN08wRkJSVVFzV1VGQlNTeFBRVUZQTEVkQlFVY3NRMEZCUXl4eFJFRkJiVU1zUTBGREwwTXNTVUZCU1N4eFFrRkJWU3hEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZEY0VJc1VVRkJVU3hEUVVGRExFMUJRVXNzWjBKQlFXZENMRU5CUVVNc1EwRkJRenRQUVVOd1F5eERRVUZETEVOQlFVTTdPMEZCUlVnc1ZVRkJTU3hEUVVGRExGVkJRVlVzUTBGRFlpeEpRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRM0pDTEVOQlFVTXNWMEZCVnl4RlFVRkZMRmxCUVZrc1EwRkJReXhGUVVNelFpeEhRVUZITERCQ1FVRmxMRVZCUTJ4Q0xFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVNNVFpeERRVUZETzB0QlEwZzdPenM3T3pzN08xZEJUM0ZDTEd0RFFVRkhPenM3UVVGRGRrSXNWVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUlN4RlFVRkxPMEZCUTJwRExGbEJRVWtzUjBGQlJ5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRenRCUVVOb1FpeGxRVUZMTEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUVVGQlF5eEhRVUZITEVOQlFVTXNWVUZCVlN4RlFVRkZMRWRCUVVjc1QwRkJTeXhOUVVGTkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVkQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1QwRkRka1VzUTBGQlF5eERRVUZETzB0QlEwbzdPenM3T3pzN1YwRlBaU3cwUWtGQlJ6czdPMEZCUTJwQ0xGVkJRVWtzVlVGQlZTeEhRVUZITEVsQlFVa3NRMEZCUXl4blFrRkJaMElzUTBGQlF6czdRVUZGZGtNc1owSkJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF5eERRVUZET3p0QlFVVjBReXhuUWtGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMREJDUVVGbExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hGUVVGTE8wRkJRMnhFTEZsQlFVa3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6czdRVUZGYUVJc1dVRkJTU3hOUVVGTkxFZEJRVWNzVDBGQlN5eFBRVUZQTEVOQlFVTXNZMEZCWXl4SFFVTndReXhQUVVGTExFMUJRVTBzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZEY0VJc1QwRkJTeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hEUVVGRE96dEJRVVYyUXl4WlFVRkpMRWxCUVVrc1IwRkRUaXhIUVVGSExFTkJRVU1zU1VGQlNTeHZRa0ZCVXl4RFFVRkRMRlZCUVZVc1JVRkJSU3hKUVVNM1FpeEhRVUZITEVOQlFVTXNTVUZCU1N4dlFrRkJVeXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVsQlFVa3NSMEZCUnl4UFFVRkxMR2RDUVVGblFpeERRVUZETEUxQlFVMHNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJRU3hCUVVGRExFTkJRVU03TzBGQlJURkZMRmRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVb3NTVUZCU1N4RlFVRkZMRTFCUVUwc1JVRkJUaXhOUVVGTkxFVkJRVVVzUTBGQlF5eERRVUZETzA5QlF6TkNMRU5CUVVNc1EwRkJRenRMUVVOS096czdPenM3T3p0WFFVOWxMRFJDUVVGSE96czdRVUZEYWtJc1ZVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJSU3hGUVVGTE8wRkJRMnBETEZsQlFVa3NSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF6czdRVUZGYUVJc1dVRkJTU3hQUVVGTExFOUJRVThzUTBGQlF5eExRVUZMTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJSU3hwUTBGQmMwSXNSVUZCUlR0QlFVTjJSQ3hwUWtGQlN5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhQUVVGTExHZENRVUZuUWl4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFOUJRVXNzVlVGQlZTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1UwRkRla1U3VDBGRFJpeERRVUZETEVOQlFVTTdTMEZEU2pzN096czdPenM3VjBGUGEwSXNLMEpCUVVjN096dEJRVU53UWl4VlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRVZCUVVzN1FVRkRha01zV1VGQlNTeEhRVUZITEVkQlFVY3NRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRE96dEJRVVZvUWl4WlFVRkpMRTlCUVVzc1QwRkJUeXhEUVVGRExFdEJRVXNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMR2xEUVVGelFpeEZRVUZGTzBGQlEzWkVMR05CUVVrc1MwRkJTeXhIUVVGSExFOUJRVXNzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1QwRkJTeXhuUWtGQlowSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE96dEJRVVV2UkN4alFVRkpMRXRCUVVzc1NVRkJTU3hKUVVGSkxFVkJRVVU3UVVGRGFrSXNiVUpCUVVzc1VVRkJVU3hEUVVGRExFVkJRVVVzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0WFFVTXhRanRUUVVOR08wOUJRMFlzUTBGQlF5eERRVUZETzB0QlEwbzdPenM3T3pzN096dFhRVkZaTEhWQ1FVRkRMRXRCUVVzc1JVRkJSVHM3UVVGRmJrSXNWVUZCU1N4TFFVRkxMRU5CUVVNc1MwRkJTeXhMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU55UWl4bFFVRlBPMDlCUTFJN096czdPMEZCUzBRc1ZVRkJTU3hKUVVGSkxFTkJRVU1zVTBGQlV5eEZRVUZGTzBGQlEyeENMRmxCUVVrc1EwRkJReXhYUVVGWExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdUMEZEZWtJN096dEJRVWRFTEZWQlFVa3NXVUZCV1N4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTTdRVUZETVVNc1ZVRkJTU3haUVVGWkxFTkJRVU1zUlVGQlJTeHBRMEZCYzBJc1JVRkJSVHRCUVVONlF5eGxRVUZQTzA5QlExSTdPMEZCUlVRc1ZVRkJTU3hUUVVGVExFZEJRVWNzV1VGQldTeERRVUZETEV0QlFVc3NSVUZCUlN4RFFVRkRPMEZCUTNKRExGVkJRVWtzVjBGQlZ5eEhRVUZITEVsQlFVa3NRMEZCUXl4aFFVRmhMRU5CUTJwRExFVkJRVVVzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZEWWl4SFFVRkhMR2xEUVVGelFpeERRVUZETzBGQlF6ZENMRlZCUVVrc1dVRkJXU3hIUVVGSExFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlEyeERMRVZCUVVVc1EwRkJReXhUUVVGVExFZEJRVWNzUTBGQlF5eERRVUZETEVOQlEycENMRWRCUVVjc2FVTkJRWE5DTEVOQlFVTTdPMEZCUlRkQ0xGVkJRVWtzVTBGQlV5eEhRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTTdRVUZEYUVRc1ZVRkJTU3hWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6czdRVUZGYkVRc1ZVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ6dEJRVU5tTEcxQ1FVRlhMRVZCUVZnc1YwRkJWenRCUVVOWUxHOUNRVUZaTEVWQlFWb3NXVUZCV1R0QlFVTmFMRzlDUVVGWkxFVkJRVm9zV1VGQldUczdRVUZGV2l4alFVRk5MRVZCUVVVc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eExRVUZMTEVOQlFVTTdPMEZCUlM5Q0xHTkJRVTBzUlVGQlJUdEJRVU5PTEdOQlFVa3NSVUZCUlN4VFFVRlRPMEZCUTJZc1pVRkJTeXhGUVVGRkxGVkJRVlU3VTBGRGJFSTdRVUZEUkN4cFFrRkJVeXhGUVVGRk8wRkJRMVFzWTBGQlNTeEZRVUZGTEZOQlFWTTdRVUZEWml4bFFVRkxMRVZCUVVVc1ZVRkJWVHRUUVVOc1FqdFBRVU5HTEVOQlFVTTdPMEZCUlVZc1ZVRkJTU3hEUVVGRExGVkJRVlVzUTBGRFlpeEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVTnVRaXhEUVVGRExGZEJRVmNzUlVGQlJTeFhRVUZYTEVOQlFVTXNSVUZETVVJc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUXpsQ0xFTkJRVU03UVVGRFJpeFZRVUZKTEVOQlFVTXNWVUZCVlN4RFFVTmlMRWxCUVVrc1EwRkJReXhqUVVGakxFVkJRMjVDTEVOQlFVTXNVMEZCVXl4RlFVRkZMRlZCUVZVc1EwRkJReXhGUVVOMlFpeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGRE5VSXNRMEZCUXpzN1FVRkZSaXhWUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4UlFVRlJMR2xEUVVGelFpeERRVUZET3p0QlFVVjBSU3hwUWtGQlZ5eERRVU5TTEVkQlFVY3NRMEZCUXl4WlFVRlpMRU5CUVVNc1EwRkRha0lzUjBGQlJ5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTnFRaXhSUVVGUkxHdERRVUYxUWl4RFFVRkRPenRCUVVWdVF5eFZRVUZKTEVOQlFVTXNXVUZCV1N4blEwRkZaaXhEUVVGRExGZEJRVmNzUlVGQlJTeFpRVUZaTEVWQlFVVXNVMEZCVXl4RlFVRkZMRlZCUVZVc1EwRkJReXhGUVVOc1JDeExRVUZMTEVOQlEwNHNRMEZCUXpzN1FVRkZSaXhYUVVGTExFTkJRVU1zWTBGQll5eEZRVUZGTEVOQlFVTTdTMEZEZUVJN096czdPenM3T3p0WFFWRlpMSFZDUVVGRExFdEJRVXNzUlVGQlJUdEJRVU51UWl4VlFVRkpMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETzBGQlEzaENMRlZCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eEZRVUZGTzBGQlEyNUNMR1ZCUVU4N1QwRkRVanM3TzBGQlIwUXNWVUZCU1N4VlFVRlZMRWRCUTFvc1FVRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlFTeEhRVUZKTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1MwRkJTeXhGUVVGRkxFZEJRVWtzUjBGQlJ5eERRVUZETzBGQlEzUkZMRlZCUVVrc1ZVRkJWU3hMUVVGTExFTkJRVU1zUlVGQlJUdEJRVU53UWl4bFFVRlBPMDlCUTFJN08wRkJSVVFzVlVGQlNTeFZRVUZWTEVkQlFVY3NSVUZCUlN4RFFVRkRMRmRCUVZjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dEJRVU51UXl4VlFVRkpMRmRCUVZjc1IwRkJSeXhGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTNKRExGVkJRVWtzVTBGQlV5eFpRVUZCTzFWQlFVVXNWVUZCVlN4WlFVRkJMRU5CUVVNN08wRkJSVEZDTEZWQlFVa3NWVUZCVlN4SFFVRkhMRU5CUVVNc1JVRkJSVHRCUVVOc1FpeHBRa0ZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRemRDTEVWQlFVVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hKUVVGSkxFVkJRVVVzUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4SFFVRkhMRVZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zUzBGQlN5eERRVUZCTEVGQlFVTXNRMEZEZUVRc1EwRkJRenRCUVVOR0xHdENRVUZWTEVkQlFVY3NTVUZCU1N4RFFVRkRMR05CUVdNc1EwRkJReXhGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSMEZCUnl4VlFVRlZMRU5CUVVNc1EwRkJRenRQUVVOb1JTeE5RVUZOTEVsQlFVa3NWVUZCVlN4SFFVRkhMRU5CUVVNc1JVRkJSVHRCUVVONlFpeHBRa0ZCVXl4SFFVRkhMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRWRCUVVjc1ZVRkJWU3hEUVVGRExFTkJRVU03UVVGRE4wUXNhMEpCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWTBGQll5eERRVU01UWl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzU1VGQlNTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUVN4QlFVRkRMRU5CUTNaRUxFTkJRVU03VDBGRFNEczdRVUZGUkN4VlFVRkpMRlZCUVZVc1JVRkJSVHRCUVVOa0xGbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE8wOUJRM1JETzBGQlEwUXNWVUZCU1N4WFFVRlhMRVZCUVVVN1FVRkRaaXhaUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEZkQlFWY3NSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRQUVVONFF6czdRVUZGUkN4UlFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUjBGQlJ5eFRRVUZUTEVOQlFVTTdRVUZET1VJc1VVRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVkQlFVY3NWVUZCVlN4RFFVRkRPenRCUVVWb1F5eGhRVUZQTEVsQlFVa3NRMEZCUXl4WlFVRlpMREJDUVVWMFFpeERRVUZETEVWQlFVVXNRMEZCUXl4WFFVRlhMRVZCUVVVc1JVRkJSU3hEUVVGRExGbEJRVmtzUlVGQlJTeFRRVUZUTEVWQlFVVXNWVUZCVlN4RFFVRkRMRVZCUTNoRUxFdEJRVXNzUTBGRFRpeERRVUZETzB0QlEwZzdPenM3T3pzN096dFhRVkZWTEhGQ1FVRkRMRXRCUVVzc1JVRkJSVHRCUVVOcVFpeFZRVUZKTEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRE8wRkJRM2hDTEZWQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRk8wRkJRMjVDTEdWQlFVODdUMEZEVWpzN1FVRkZSQ3hWUVVGSkxFTkJRVU1zV1VGQldTeERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpMRVZCUVVVc1EwRkRja01zVTBGQlV5eEZRVU5VTEZWQlFWVXNSVUZEVml4WFFVRlhMRVZCUTFnc1YwRkJWeXhEUVVOYUxFTkJRVU1zUTBGQlF6czdRVUZGU0N4VlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eFhRVUZYTEdsRFFVRnpRaXhEUVVGRE96dEJRVVY2UlN4UlFVRkZMRU5CUVVNc1YwRkJWeXhEUVVOWUxFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUTNCQ0xFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUTNCQ0xGZEJRVmNzYTBOQlFYVkNMRU5CUVVNN08wRkJSWFJETEZWQlFVa3NRMEZCUXl4blFrRkJaMElzUlVGQlJTeERRVUZETzBGQlEzaENMRlZCUVVrc1EwRkJReXhuUWtGQlowSXNSVUZCUlN4RFFVRkRPenRCUVVWNFFpeFZRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRWxCUVVrc1EwRkJRenM3UVVGRmRFSXNZVUZCVHl4SlFVRkpMRU5CUVVNc1dVRkJXU3dyUWtGRmRFSXNRMEZCUXl4RlFVRkZMRU5CUVVNc1YwRkJWeXhGUVVGRkxFVkJRVVVzUTBGQlF5eFpRVUZaTEVWQlFVVXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFVkJRVVVzUlVGQlJTeERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkRlRVVzUzBGQlN5eERRVU5PTEVOQlFVTTdTMEZEU0RzN096czdPenM3T3p0WFFWTk5MRzFDUVVGSE8wRkJRMUlzVlVGQlNTeE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJRenRCUVVONlFpeFZRVUZKTEZGQlFWRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc01FSkJRV1VzUTBGQlF5eERRVUZET3p0QlFVVTVSQ3hWUVVGSkxFTkJRVU1zV1VGQldTeERRVU5tTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkRja1VzUTBGQlF6czdRVUZGUml4alFVRlJMRU5CUVVNc1ZVRkJWU3h2UWtGQlV5eERRVUZETzBGQlF6ZENMRmxCUVUwc1EwRkJReXhWUVVGVkxIRkNRVUZWTEVOQlFVTTdPMEZCUlRWQ0xGVkJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dEJRVU12UWl4VlFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUXpkQ0xGVkJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUXpGQ0xGVkJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRPenRCUVVWdVFpeGhRVUZQTEUxQlFVMHNRMEZCUXp0TFFVTm1PenM3T3pzN096czdPenM3TzFkQldWTXNiMEpCUVVNc1QwRkJUeXhGUVVGRkxFMUJRVTBzUlVGQlJTeHJRa0ZCYTBJc1JVRkJSU3hSUVVGUkxFVkJRVVU3UVVGRGVFUXNWVUZCU1N4UFFVRlBMRTFCUVUwc1MwRkJTeXhSUVVGUkxFVkJRVVU3UVVGRE9VSXNZMEZCVFN4SFFVRkhMRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETzA5QlF6TkNMRTFCUVUwN1FVRkRUQ3hqUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hIUVVGSExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNN1QwRkRMME03TzBGQlJVUXNWVUZCU1N4VFFVRlRMRU5CUVVNc1RVRkJUU3hIUVVGSExFTkJRVU1zUlVGQlJUdEJRVU40UWl4bFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFMUJRVTBzUlVGQlJTeHJRa0ZCYTBJc1JVRkJSU3hSUVVGUkxFTkJRVU1zUTBGQlF6dFBRVU5zUkN4TlFVRk5PMEZCUTB3c1pVRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVWQlFVVXNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF6dFBRVU40UXp0TFFVTkdPenM3T3pzN096czdPenRYUVZWWExITkNRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVVN1FVRkROVUlzVlVGQlNTeFBRVUZQTEUxQlFVMHNTMEZCU3l4UlFVRlJMRVZCUVVVN1FVRkRPVUlzWTBGQlRTeEhRVUZITEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8wOUJRek5DTEUxQlFVMHNTVUZCU1N4TlFVRk5MRWxCUVVrc1NVRkJTU3hGUVVGRk8wRkJRM3BDTEdOQlFVMHNSMEZCUnl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF6dFBRVU12UXl4TlFVRk5PMEZCUTB3c1kwRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTTdUMEZEYkVJN08wRkJSVVFzWVVGQlR5eERRVUZETEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRMUVVOeVFqczdPenM3T3pzN096czdPenM3TzFkQlkxY3NjMEpCUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeGhRVUZoTEVWQlFVVTdRVUZEZEVNc1ZVRkJTU3hMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRCUVVNeFFpeFZRVUZKTEV0QlFVc3NRMEZCUXl4aFFVRmhMRVZCUVVVN1FVRkRka0lzWVVGQlN5eERRVUZETEdGQlFXRXNSMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVVzUlVGQlJTeGhRVUZoTEVOQlFVTXNRMEZCUXp0UFFVTnVSRHM3UVVGRlJDeGhRVUZQTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFbEJRVWtzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXp0TFFVTTVSRHM3T3pzN096czdPenM3VjBGVlpTd3dRa0ZCUXl4SFFVRkhMRVZCUVVVN1FVRkRjRUlzWVVGQlR5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc05FSkJRV2xDTEVkQlFVY3NSMEZCUnl4SFFVRkhMRWRCUVVjc1EwRkJReXhKUVVGSkxESkNRVUZuUWl4RFFVRkRPMHRCUXpORk96czdPenM3T3pzN096dFhRVlZUTEc5Q1FVRkRMRTlCUVU4c1JVRkJSVHRCUVVOc1FpeGhRVUZQTEU5QlFVOHNSMEZCUnl4VlFVRlZMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0TFFVTjJSVHM3T3pzN096czdPenM3VjBGVlR5eHJRa0ZCUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhGUVVGRk8wRkJRM1pDTEZkQlFVc3NSMEZCUnl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETzBGQlEzcENMRmRCUVVzc1IwRkJSeXhMUVVGTExFZEJRVWNzUTBGQlF5eEhRVUZITEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNN1FVRkRPVUlzWVVGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRWRCUVVjc1MwRkJTeXhIUVVGSExFZEJRVWNzUTBGQlF6dExRVU51UXpzN096czdPenM3T3pzN08xZEJWMkVzZDBKQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTNCQ0xGVkJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRWxCUVVrc1UwRkJVeXhGUVVGRk8wRkJRM1JETEdGQlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8wOUJRMmhFT3p0QlFVVkVMRlZCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVsQlFVa3NVMEZCVXl4RlFVRkZPMEZCUTNSRExHRkJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRPMDlCUTJoRU96dEJRVVZFTEdGQlFVOHNTMEZCU3l4RFFVRkRPMHRCUTJRN096czdPenM3T3pzN096czdWMEZaVlN4eFFrRkJReXhMUVVGTExFVkJRVVU3UVVGRGFrSXNWVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVVN1FVRkRja01zWlVGQlR5eERRVU5NTEV0QlFVc3NRMEZCUXl4aFFVRmhMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4aFFVRmhMRU5CUVVNc1kwRkJZeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTEVOQlEzWkZMRXRCUVVzc1EwRkJRenRQUVVOVU8wRkJRMFFzWVVGQlR5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRPMHRCUTNCQ096czdVMEZvWm10Q0xHZENRVUZuUWpzN08zRkNRVUZvUWl4blFrRkJaMEk3TzBGQmJXWnlReXhuUWtGQlowSXNRMEZCUXl4UlFVRlJMRWRCUVVjN1FVRkRNVUlzVlVGQlVTeEZRVUZGTEd0Q1FVRlZMRTFCUVUwc1JVRkJSVHRCUVVNeFFpeFJRVUZKTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZGTzBGQlF5OUNMRzlEUVVGdFFqdExRVU53UWpzN1FVRkZSQ3hyUTBGQmJVSTdSMEZEY0VJN1FVRkRSQ3hQUVVGTExFVkJRVVVzVFVGQlRTeERRVUZETEV0QlFVczdRVUZEYmtJc1kwRkJXU3hGUVVGRkxFbEJRVWs3UVVGRGJFSXNaMEpCUVdNc1JVRkJSU3hKUVVGSk8wRkJRM0JDTEZWQlFWRXNSVUZCUlN4SlFVRkpPMEZCUTJRc1ZVRkJVU3hGUVVGRkxFbEJRVWs3UTBGRFppeERRVUZET3p0QlFVVkdMR2RDUVVGblFpeERRVUZETEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNN096czdPenM3T3p0QlF6Tm9RbkJDTEVsQlFVMHNVVUZCVVN4SFFVRkhMR3RDUVVGclFpeERRVUZET3p0QlFVTndReXhKUVVGTkxHVkJRV1VzUjBGQlJ5eHpRa0ZCYzBJc1EwRkJRenM3UVVGREwwTXNTVUZCVFN4alFVRmpMRWRCUVVjc2NVSkJRWEZDTEVOQlFVTTdPMEZCUXpkRExFbEJRVTBzVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXpzN08wRkJSWEpDTEVsQlFVMHNiMEpCUVc5Q0xFZEJRVWNzYlVKQlFXMUNMRU5CUVVNN08wRkJRMnBFTEVsQlFVMHNjVUpCUVhGQ0xFZEJRVWNzYjBKQlFXOUNMRU5CUVVNN08wRkJRMjVFTEVsQlFVMHNXVUZCV1N4SFFVRkhMRmRCUVZjc1EwRkJRenM3UVVGRGFrTXNTVUZCVFN4elFrRkJjMElzUjBGQlJ5eHhRa0ZCY1VJc1EwRkJRenM3TzBGQlJYSkVMRWxCUVUwc2EwSkJRV3RDTEVkQlFVY3NjVUpCUVhGQ0xFTkJRVU03TzBGQlEycEVMRWxCUVUwc1dVRkJXU3hIUVVGSExHVkJRV1VzUTBGQlF6czdRVUZEY2tNc1NVRkJUU3hwUWtGQmFVSXNSMEZCUnl4dlFrRkJiMElzUTBGQlF6czdPMEZCUlM5RExFbEJRVTBzVjBGQlZ5eEhRVUZITEhWQ1FVRjFRaXhEUVVGRE96dEJRVU0xUXl4SlFVRk5MRmRCUVZjc1IwRkJSeXgxUWtGQmRVSXNRMEZCUXpzN1FVRkROVU1zU1VGQlRTeHZRa0ZCYjBJc2IwSkJRVzlDTEVOQlFVTTdPenM3T3pzN096czdPenR4UWtOb1FucENMRk5CUVZNN096czdkVUpCUTJ4Q0xGZEJRVmNpTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpaG1kVzVqZEdsdmJpQmxLSFFzYml4eUtYdG1kVzVqZEdsdmJpQnpLRzhzZFNsN2FXWW9JVzViYjEwcGUybG1LQ0YwVzI5ZEtYdDJZWElnWVQxMGVYQmxiMllnY21WeGRXbHlaVDA5WENKbWRXNWpkR2x2Ymx3aUppWnlaWEYxYVhKbE8ybG1LQ0YxSmlaaEtYSmxkSFZ5YmlCaEtHOHNJVEFwTzJsbUtHa3BjbVYwZFhKdUlHa29ieXdoTUNrN2RtRnlJR1k5Ym1WM0lFVnljbTl5S0Z3aVEyRnVibTkwSUdacGJtUWdiVzlrZFd4bElDZGNJaXR2SzF3aUoxd2lLVHQwYUhKdmR5Qm1MbU52WkdVOVhDSk5UMFJWVEVWZlRrOVVYMFpQVlU1RVhDSXNabjEyWVhJZ2JEMXVXMjlkUFh0bGVIQnZjblJ6T250OWZUdDBXMjlkV3pCZExtTmhiR3dvYkM1bGVIQnZjblJ6TEdaMWJtTjBhVzl1S0dVcGUzWmhjaUJ1UFhSYmIxMWJNVjFiWlYwN2NtVjBkWEp1SUhNb2JqOXVPbVVwZlN4c0xHd3VaWGh3YjNKMGN5eGxMSFFzYml4eUtYMXlaWFIxY200Z2JsdHZYUzVsZUhCdmNuUnpmWFpoY2lCcFBYUjVjR1Z2WmlCeVpYRjFhWEpsUFQxY0ltWjFibU4wYVc5dVhDSW1KbkpsY1hWcGNtVTdabTl5S0haaGNpQnZQVEE3Ynp4eUxteGxibWQwYUR0dkt5c3BjeWh5VzI5ZEtUdHlaWFIxY200Z2MzMHBJaXdpYVcxd2IzSjBJRkpsYzJsNllXSnNaVU52YkhWdGJuTWdabkp2YlNBbkxpOWpiR0Z6Y3ljN1hHNXBiWEJ2Y25RZ2UwUkJWRUZmUVZCSmZTQm1jbTl0SUNjdUwyTnZibk4wWVc1MGN5YzdYRzVjYmlRdVptNHVjbVZ6YVhwaFlteGxRMjlzZFcxdWN5QTlJR1oxYm1OMGFXOXVLRzl3ZEdsdmJuTlBjazFsZEdodlpDd2dMaTR1WVhKbmN5a2dlMXh1WEhSeVpYUjFjbTRnZEdocGN5NWxZV05vS0daMWJtTjBhVzl1S0NrZ2UxeHVYSFJjZEd4bGRDQWtkR0ZpYkdVZ1BTQWtLSFJvYVhNcE8xeHVYRzVjZEZ4MGJHVjBJR0Z3YVNBOUlDUjBZV0pzWlM1a1lYUmhLRVJCVkVGZlFWQkpLVHRjYmx4MFhIUnBaaUFvSVdGd2FTa2dlMXh1WEhSY2RGeDBZWEJwSUQwZ2JtVjNJRkpsYzJsNllXSnNaVU52YkhWdGJuTW9KSFJoWW14bExDQnZjSFJwYjI1elQzSk5aWFJvYjJRcE8xeHVYSFJjZEZ4MEpIUmhZbXhsTG1SaGRHRW9SRUZVUVY5QlVFa3NJR0Z3YVNrN1hHNWNkRngwZlZ4dVhHNWNkRngwWld4elpTQnBaaUFvZEhsd1pXOW1JRzl3ZEdsdmJuTlBjazFsZEdodlpDQTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JseDBYSFJjZEhKbGRIVnliaUJoY0dsYmIzQjBhVzl1YzA5eVRXVjBhRzlrWFNndUxpNWhjbWR6S1R0Y2JseDBYSFI5WEc1Y2RIMHBPMXh1ZlR0Y2JseHVKQzV5WlhOcGVtRmliR1ZEYjJ4MWJXNXpJRDBnVW1WemFYcGhZbXhsUTI5c2RXMXVjenRjYmlJc0ltbHRjRzl5ZENCN1hHNGdJRVJCVkVGZlFWQkpMRnh1SUNCRVFWUkJYME5QVEZWTlRsTmZTVVFzWEc0Z0lFUkJWRUZmUTA5TVZVMU9YMGxFTEZ4dUlDQkVRVlJCWDFSSUxGeHVJQ0JEVEVGVFUxOVVRVUpNUlY5U1JWTkpXa2xPUnl4Y2JpQWdRMHhCVTFOZlEwOU1WVTFPWDFKRlUwbGFTVTVITEZ4dUlDQkRURUZUVTE5SVFVNUVURVVzWEc0Z0lFTk1RVk5UWDBoQlRrUk1SVjlEVDA1VVFVbE9SVklzWEc0Z0lFVldSVTVVWDFKRlUwbGFSVjlUVkVGU1ZDeGNiaUFnUlZaRlRsUmZVa1ZUU1ZwRkxGeHVJQ0JGVmtWT1ZGOVNSVk5KV2tWZlUxUlBVQ3hjYmlBZ1UwVk1SVU5VVDFKZlZFZ3NYRzRnSUZORlRFVkRWRTlTWDFSRUxGeHVJQ0JUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlN4Y2JuMGdabkp2YlNBbkxpOWpiMjV6ZEdGdWRITW5PMXh1WEc0dktpcGNibFJoYTJWeklHRWdQSFJoWW14bElDOCtJR1ZzWlcxbGJuUWdZVzVrSUcxaGEyVnpJR2wwSjNNZ1kyOXNkVzF1Y3lCeVpYTnBlbUZpYkdVZ1lXTnliM056SUdKdmRHaGNibTF2WW1sc1pTQmhibVFnWkdWemEzUnZjQ0JqYkdsbGJuUnpMbHh1WEc1QVkyeGhjM01nVW1WemFYcGhZbXhsUTI5c2RXMXVjMXh1UUhCaGNtRnRJQ1IwWVdKc1pTQjdhbEYxWlhKNWZTQnFVWFZsY25rdGQzSmhjSEJsWkNBOGRHRmliR1UrSUdWc1pXMWxiblFnZEc4Z2JXRnJaU0J5WlhOcGVtRmliR1ZjYmtCd1lYSmhiU0J2Y0hScGIyNXpJSHRQWW1wbFkzUjlJRU52Ym1acFozVnlZWFJwYjI0Z2IySnFaV04wWEc0cUtpOWNibVY0Y0c5eWRDQmtaV1poZFd4MElHTnNZWE56SUZKbGMybDZZV0pzWlVOdmJIVnRibk1nZTF4dUlDQmpiMjV6ZEhKMVkzUnZjaWdrZEdGaWJHVXNJRzl3ZEdsdmJuTXBJSHRjYmlBZ0lDQjBhR2x6TG01eklEMGdKeTV5WXljZ0t5QjBhR2x6TG1OdmRXNTBLeXM3WEc1Y2JpQWdJQ0IwYUdsekxtOXdkR2x2Ym5NZ1BTQWtMbVY0ZEdWdVpDaDdmU3dnVW1WemFYcGhZbXhsUTI5c2RXMXVjeTVrWldaaGRXeDBjeXdnYjNCMGFXOXVjeWs3WEc1Y2JpQWdJQ0IwYUdsekxpUjNhVzVrYjNjZ1BTQWtLSGRwYm1SdmR5azdYRzRnSUNBZ2RHaHBjeTRrYjNkdVpYSkViMk4xYldWdWRDQTlJQ1FvSkhSaFlteGxXekJkTG05M2JtVnlSRzlqZFcxbGJuUXBPMXh1SUNBZ0lIUm9hWE11SkhSaFlteGxJRDBnSkhSaFlteGxPMXh1WEc0Z0lDQWdkR2hwY3k1eVpXWnlaWE5vU0dWaFpHVnljeWdwTzF4dUlDQWdJSFJvYVhNdWNtVnpkRzl5WlVOdmJIVnRibGRwWkhSb2N5Z3BPMXh1SUNBZ0lIUm9hWE11YzNsdVkwaGhibVJzWlZkcFpIUm9jeWdwTzF4dVhHNGdJQ0FnZEdocGN5NWlhVzVrUlhabGJuUnpLSFJvYVhNdUpIZHBibVJ2ZHl3Z0ozSmxjMmw2WlNjc0lIUm9hWE11YzNsdVkwaGhibVJzWlZkcFpIUm9jeTVpYVc1a0tIUm9hWE1wS1R0Y2JseHVJQ0FnSUdsbUlDaDBhR2x6TG05d2RHbHZibk11YzNSaGNuUXBJSHRjYmlBZ0lDQWdJSFJvYVhNdVltbHVaRVYyWlc1MGN5aDBhR2x6TGlSMFlXSnNaU3dnUlZaRlRsUmZVa1ZUU1ZwRlgxTlVRVkpVTENCMGFHbHpMbTl3ZEdsdmJuTXVjM1JoY25RcE8xeHVJQ0FnSUgxY2JpQWdJQ0JwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbkpsYzJsNlpTa2dlMXh1SUNBZ0lDQWdkR2hwY3k1aWFXNWtSWFpsYm5SektIUm9hWE11SkhSaFlteGxMQ0JGVmtWT1ZGOVNSVk5KV2tVc0lIUm9hWE11YjNCMGFXOXVjeTV5WlhOcGVtVXBPMXh1SUNBZ0lIMWNiaUFnSUNCcFppQW9kR2hwY3k1dmNIUnBiMjV6TG5OMGIzQXBJSHRjYmlBZ0lDQWdJSFJvYVhNdVltbHVaRVYyWlc1MGN5aDBhR2x6TGlSMFlXSnNaU3dnUlZaRlRsUmZVa1ZUU1ZwRlgxTlVUMUFzSUhSb2FYTXViM0IwYVc5dWN5NXpkRzl3S1R0Y2JpQWdJQ0I5WEc0Z0lIMWNibHh1SUNBdktpcGNiaUFnVW1WbWNtVnphR1Z6SUhSb1pTQm9aV0ZrWlhKeklHRnpjMjlqYVdGMFpXUWdkMmwwYUNCMGFHbHpJR2x1YzNSaGJtTmxjeUE4ZEdGaWJHVXZQaUJsYkdWdFpXNTBJR0Z1WkZ4dUlDQm5aVzVsY21GMFpYTWdhR0Z1Wkd4bGN5Qm1iM0lnZEdobGJTNGdRV3h6YnlCaGMzTnBaMjV6SUhCbGNtTmxiblJoWjJVZ2QybGtkR2h6TGx4dVhHNGdJRUJ0WlhSb2IyUWdjbVZtY21WemFFaGxZV1JsY25OY2JpQWdLaW92WEc0Z0lISmxabkpsYzJoSVpXRmtaWEp6S0NrZ2UxeHVJQ0FnSUM4dklFRnNiRzkzSUhSb1pTQnpaV3hsWTNSdmNpQjBieUJpWlNCaWIzUm9JR0VnY21WbmRXeGhjaUJ6Wld4amRHOXlJSE4wY21sdVp5QmhjeUIzWld4c0lHRnpYRzRnSUNBZ0x5OGdZU0JrZVc1aGJXbGpJR05oYkd4aVlXTnJYRzRnSUNBZ2JHVjBJSE5sYkdWamRHOXlJRDBnZEdocGN5NXZjSFJwYjI1ekxuTmxiR1ZqZEc5eU8xeHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ2MyVnNaV04wYjNJZ1BUMDlJQ2RtZFc1amRHbHZiaWNwSUh0Y2JpQWdJQ0FnSUhObGJHVmpkRzl5SUQwZ2MyVnNaV04wYjNJdVkyRnNiQ2gwYUdsekxDQjBhR2x6TGlSMFlXSnNaU2s3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnVTJWc1pXTjBJR0ZzYkNCMFlXSnNaU0JvWldGa1pYSnpYRzRnSUNBZ2RHaHBjeTRrZEdGaWJHVklaV0ZrWlhKeklEMGdkR2hwY3k0a2RHRmliR1V1Wm1sdVpDaHpaV3hsWTNSdmNpazdYRzVjYmlBZ0lDQXZMeUJCYzNOcFoyNGdjR1Z5WTJWdWRHRm5aU0IzYVdSMGFITWdabWx5YzNRc0lIUm9aVzRnWTNKbFlYUmxJR1J5WVdjZ2FHRnVaR3hsYzF4dUlDQWdJSFJvYVhNdVlYTnphV2R1VUdWeVkyVnVkR0ZuWlZkcFpIUm9jeWdwTzF4dUlDQWdJSFJvYVhNdVkzSmxZWFJsU0dGdVpHeGxjeWdwTzF4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUVOeVpXRjBaWE1nWkhWdGJYa2dhR0Z1Wkd4bElHVnNaVzFsYm5SeklHWnZjaUJoYkd3Z2RHRmliR1VnYUdWaFpHVnlJR052YkhWdGJuTmNibHh1SUNCQWJXVjBhRzlrSUdOeVpXRjBaVWhoYm1Sc1pYTmNiaUFnS2lvdlhHNGdJR055WldGMFpVaGhibVJzWlhNb0tTQjdYRzRnSUNBZ2JHVjBJSEpsWmlBOUlIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjanRjYmlBZ0lDQnBaaUFvY21WbUlDRTlJRzUxYkd3cElIdGNiaUFnSUNBZ0lISmxaaTV5WlcxdmRtVW9LVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWElnUFNBa0tHQThaR2wySUdOc1lYTnpQU2NrZTBOTVFWTlRYMGhCVGtSTVJWOURUMDVVUVVsT1JWSjlKeUF2UG1BcE8xeHVJQ0FnSUhSb2FYTXVKSFJoWW14bExtSmxabTl5WlNoMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSXBPMXh1WEc0Z0lDQWdkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZoWTJnb0tHa3NJR1ZzS1NBOVBpQjdYRzRnSUNBZ0lDQnNaWFFnSkdOMWNuSmxiblFnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpYRW9hU2s3WEc0Z0lDQWdJQ0JzWlhRZ0pHNWxlSFFnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpYRW9hU0FySURFcE8xeHVYRzRnSUNBZ0lDQnBaaUFvWEc0Z0lDQWdJQ0FnSUNSdVpYaDBMbXhsYm1kMGFDQTlQVDBnTUNCOGZGeHVJQ0FnSUNBZ0lDQWtZM1Z5Y21WdWRDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrZ2ZIeGNiaUFnSUNBZ0lDQWdKRzVsZUhRdWFYTW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwWEc0Z0lDQWdJQ0FwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNCc1pYUWdKR2hoYm1Sc1pTQTlJQ1FvWUR4a2FYWWdZMnhoYzNNOUp5UjdRMHhCVTFOZlNFRk9SRXhGZlNjZ0x6NWdLVnh1SUNBZ0lDQWdJQ0F1WkdGMFlTaEVRVlJCWDFSSUxDQWtLR1ZzS1NsY2JpQWdJQ0FnSUNBZ0xtRndjR1Z1WkZSdktIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaWs3WEc0Z0lDQWdmU2s3WEc1Y2JpQWdJQ0IwYUdsekxtSnBibVJGZG1WdWRITW9YRzRnSUNBZ0lDQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWElzWEc0Z0lDQWdJQ0JiSjIxdmRYTmxaRzkzYmljc0lDZDBiM1ZqYUhOMFlYSjBKMTBzWEc0Z0lDQWdJQ0FuTGljZ0t5QkRURUZUVTE5SVFVNUVURVVzWEc0Z0lDQWdJQ0IwYUdsekxtOXVVRzlwYm5SbGNrUnZkMjR1WW1sdVpDaDBhR2x6S1N4Y2JpQWdJQ0FwTzF4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUVGemMybG5ibk1nWVNCd1pYSmpaVzUwWVdkbElIZHBaSFJvSUhSdklHRnNiQ0JqYjJ4MWJXNXpJR0poYzJWa0lHOXVJSFJvWldseUlHTjFjbkpsYm5RZ2NHbDRaV3dnZDJsa2RHZ29jeWxjYmx4dUlDQkFiV1YwYUc5a0lHRnpjMmxuYmxCbGNtTmxiblJoWjJWWGFXUjBhSE5jYmlBZ0tpb3ZYRzRnSUdGemMybG5ibEJsY21ObGJuUmhaMlZYYVdSMGFITW9LU0I3WEc0Z0lDQWdkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZoWTJnb0tGOHNJR1ZzS1NBOVBpQjdYRzRnSUNBZ0lDQnNaWFFnSkdWc0lEMGdKQ2hsYkNrN1hHNGdJQ0FnSUNCMGFHbHpMbk5sZEZkcFpIUm9LQ1JsYkZzd1hTd2dLQ1JsYkM1dmRYUmxjbGRwWkhSb0tDa2dMeUIwYUdsekxpUjBZV0pzWlM1M2FXUjBhQ2dwS1NBcUlERXdNQ2s3WEc0Z0lDQWdmU2s3WEc0Z0lIMWNibHh1SUNBdktpcGNibHh1WEc0Z0lFQnRaWFJvYjJRZ2MzbHVZMGhoYm1Sc1pWZHBaSFJvYzF4dUlDQXFLaTljYmlBZ2MzbHVZMGhoYm1Sc1pWZHBaSFJvY3lncElIdGNiaUFnSUNCc1pYUWdKR052Ym5SaGFXNWxjaUE5SUhSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNqdGNibHh1SUNBZ0lDUmpiMjUwWVdsdVpYSXVkMmxrZEdnb2RHaHBjeTRrZEdGaWJHVXVkMmxrZEdnb0tTazdYRzVjYmlBZ0lDQWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb0p5NG5JQ3NnUTB4QlUxTmZTRUZPUkV4RktTNWxZV05vS0NoZkxDQmxiQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ2JHVjBJQ1JsYkNBOUlDUW9aV3dwTzF4dVhHNGdJQ0FnSUNCc1pYUWdhR1ZwWjJoMElEMGdkR2hwY3k1dmNIUnBiMjV6TG5KbGMybDZaVVp5YjIxQ2IyUjVYRzRnSUNBZ0lDQWdJRDhnZEdocGN5NGtkR0ZpYkdVdWFHVnBaMmgwS0NsY2JpQWdJQ0FnSUNBZ09pQjBhR2x6TGlSMFlXSnNaUzVtYVc1a0tDZDBhR1ZoWkNjcExtaGxhV2RvZENncE8xeHVYRzRnSUNBZ0lDQnNaWFFnYkdWbWRDQTlYRzRnSUNBZ0lDQWdJQ1JsYkM1a1lYUmhLRVJCVkVGZlZFZ3BMbTkxZEdWeVYybGtkR2dvS1NBclhHNGdJQ0FnSUNBZ0lDZ2taV3d1WkdGMFlTaEVRVlJCWDFSSUtTNXZabVp6WlhRb0tTNXNaV1owSUMwZ2RHaHBjeTRrYUdGdVpHeGxRMjl1ZEdGcGJtVnlMbTltWm5ObGRDZ3BMbXhsWm5RcE8xeHVYRzRnSUNBZ0lDQWtaV3d1WTNOektIc2diR1ZtZEN3Z2FHVnBaMmgwSUgwcE8xeHVJQ0FnSUgwcE8xeHVJQ0I5WEc1Y2JpQWdMeW9xWEc0Z0lGQmxjbk5wYzNSeklIUm9aU0JqYjJ4MWJXNGdkMmxrZEdoeklHbHVJR3h2WTJGc1UzUnZjbUZuWlZ4dVhHNGdJRUJ0WlhSb2IyUWdjMkYyWlVOdmJIVnRibGRwWkhSb2MxeHVJQ0FxS2k5Y2JpQWdjMkYyWlVOdmJIVnRibGRwWkhSb2N5Z3BJSHRjYmlBZ0lDQjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTXVaV0ZqYUNnb1h5d2daV3dwSUQwK0lIdGNiaUFnSUNBZ0lHeGxkQ0FrWld3Z1BTQWtLR1ZzS1R0Y2JseHVJQ0FnSUNBZ2FXWWdLSFJvYVhNdWIzQjBhVzl1Y3k1emRHOXlaU0FtSmlBaEpHVnNMbWx6S0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktTa2dlMXh1SUNBZ0lDQWdJQ0IwYUdsekxtOXdkR2x2Ym5NdWMzUnZjbVV1YzJWMEtIUm9hWE11WjJWdVpYSmhkR1ZEYjJ4MWJXNUpaQ2drWld3cExDQjBhR2x6TG5CaGNuTmxWMmxrZEdnb1pXd3BLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlLVHRjYmlBZ2ZWeHVYRzRnSUM4cUtseHVJQ0JTWlhSeWFXVjJaWE1nWVc1a0lITmxkSE1nZEdobElHTnZiSFZ0YmlCM2FXUjBhSE1nWm5KdmJTQnNiMk5oYkZOMGIzSmhaMlZjYmx4dUlDQkFiV1YwYUc5a0lISmxjM1J2Y21WRGIyeDFiVzVYYVdSMGFITmNiaUFnS2lvdlhHNGdJSEpsYzNSdmNtVkRiMngxYlc1WGFXUjBhSE1vS1NCN1hHNGdJQ0FnZEdocGN5NGtkR0ZpYkdWSVpXRmtaWEp6TG1WaFkyZ29LRjhzSUdWc0tTQTlQaUI3WEc0Z0lDQWdJQ0JzWlhRZ0pHVnNJRDBnSkNobGJDazdYRzVjYmlBZ0lDQWdJR2xtSUNoMGFHbHpMbTl3ZEdsdmJuTXVjM1J2Y21VZ0ppWWdJU1JsYkM1cGN5aFRSVXhGUTFSUFVsOVZUbEpGVTBsYVFVSk1SU2twSUh0Y2JpQWdJQ0FnSUNBZ2JHVjBJSGRwWkhSb0lEMGdkR2hwY3k1dmNIUnBiMjV6TG5OMGIzSmxMbWRsZENoMGFHbHpMbWRsYm1WeVlYUmxRMjlzZFcxdVNXUW9KR1ZzS1NrN1hHNWNiaUFnSUNBZ0lDQWdhV1lnS0hkcFpIUm9JQ0U5SUc1MWJHd3BJSHRjYmlBZ0lDQWdJQ0FnSUNCMGFHbHpMbk5sZEZkcFpIUm9LR1ZzTENCM2FXUjBhQ2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUgxY2JpQWdJQ0I5S1R0Y2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNCUWIybHVkR1Z5TDIxdmRYTmxJR1J2ZDI0Z2FHRnVaR3hsY2x4dVhHNGdJRUJ0WlhSb2IyUWdiMjVRYjJsdWRHVnlSRzkzYmx4dUlDQkFjR0Z5WVcwZ1pYWmxiblFnZTA5aWFtVmpkSDBnUlhabGJuUWdiMkpxWldOMElHRnpjMjlqYVdGMFpXUWdkMmwwYUNCMGFHVWdhVzUwWlhKaFkzUnBiMjVjYmlBZ0tpb3ZYRzRnSUc5dVVHOXBiblJsY2tSdmQyNG9aWFpsYm5RcElIdGNiaUFnSUNBdkx5QlBibXg1SUdGd2NHeHBaWE1nZEc4Z2JHVm1kQzFqYkdsamF5QmtjbUZuWjJsdVoxeHVJQ0FnSUdsbUlDaGxkbVZ1ZEM1M2FHbGphQ0FoUFQwZ01Ta2dlMXh1SUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUgxY2JseHVJQ0FnSUM4dklFbG1JR0VnY0hKbGRtbHZkWE1nYjNCbGNtRjBhVzl1SUdseklHUmxabWx1WldRc0lIZGxJRzFwYzNObFpDQjBhR1VnYkdGemRDQnRiM1Z6WlhWd0xseHVJQ0FnSUM4dklGQnliMkpoWW14NUlHZHZZbUpzWldRZ2RYQWdZbmtnZFhObGNpQnRiM1Z6YVc1bklHOTFkQ0IwYUdVZ2QybHVaRzkzSUhSb1pXNGdjbVZzWldGemFXNW5MbHh1SUNBZ0lDOHZJRmRsSjJ4c0lITnBiWFZzWVhSbElHRWdjRzlwYm5SbGNuVndJR2hsY21VZ2NISnBiM0lnZEc4Z2FYUmNiaUFnSUNCcFppQW9kR2hwY3k1dmNHVnlZWFJwYjI0cElIdGNiaUFnSUNBZ0lIUm9hWE11YjI1UWIybHVkR1Z5VlhBb1pYWmxiblFwTzF4dUlDQWdJSDFjYmx4dUlDQWdJQzh2SUVsbmJtOXlaU0J1YjI0dGNtVnphWHBoWW14bElHTnZiSFZ0Ym5OY2JpQWdJQ0JzWlhRZ0pHTjFjbkpsYm5SSGNtbHdJRDBnSkNobGRtVnVkQzVqZFhKeVpXNTBWR0Z5WjJWMEtUdGNiaUFnSUNCcFppQW9KR04xY25KbGJuUkhjbWx3TG1sektGTkZURVZEVkU5U1gxVk9Va1ZUU1ZwQlFreEZLU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHeGxkQ0JuY21sd1NXNWtaWGdnUFNBa1kzVnljbVZ1ZEVkeWFYQXVhVzVrWlhnb0tUdGNiaUFnSUNCc1pYUWdKR3hsWm5SRGIyeDFiVzRnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25OY2JpQWdJQ0FnSUM1bGNTaG5jbWx3U1c1a1pYZ3BYRzRnSUNBZ0lDQXVibTkwS0ZORlRFVkRWRTlTWDFWT1VrVlRTVnBCUWt4RktUdGNiaUFnSUNCc1pYUWdKSEpwWjJoMFEyOXNkVzF1SUQwZ2RHaHBjeTRrZEdGaWJHVklaV0ZrWlhKelhHNGdJQ0FnSUNBdVpYRW9aM0pwY0VsdVpHVjRJQ3NnTVNsY2JpQWdJQ0FnSUM1dWIzUW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwTzF4dVhHNGdJQ0FnYkdWMElHeGxablJYYVdSMGFDQTlJSFJvYVhNdWNHRnljMlZYYVdSMGFDZ2tiR1ZtZEVOdmJIVnRibHN3WFNrN1hHNGdJQ0FnYkdWMElISnBaMmgwVjJsa2RHZ2dQU0IwYUdsekxuQmhjbk5sVjJsa2RHZ29KSEpwWjJoMFEyOXNkVzF1V3pCZEtUdGNibHh1SUNBZ0lIUm9hWE11YjNCbGNtRjBhVzl1SUQwZ2UxeHVJQ0FnSUNBZ0pHeGxablJEYjJ4MWJXNHNYRzRnSUNBZ0lDQWtjbWxuYUhSRGIyeDFiVzRzWEc0Z0lDQWdJQ0FrWTNWeWNtVnVkRWR5YVhBc1hHNWNiaUFnSUNBZ0lITjBZWEowV0RvZ2RHaHBjeTVuWlhSUWIybHVkR1Z5V0NobGRtVnVkQ2tzWEc1Y2JpQWdJQ0FnSUhkcFpIUm9jem9nZTF4dUlDQWdJQ0FnSUNCc1pXWjBPaUJzWldaMFYybGtkR2dzWEc0Z0lDQWdJQ0FnSUhKcFoyaDBPaUJ5YVdkb2RGZHBaSFJvTEZ4dUlDQWdJQ0FnZlN4Y2JpQWdJQ0FnSUc1bGQxZHBaSFJvY3pvZ2UxeHVJQ0FnSUNBZ0lDQnNaV1owT2lCc1pXWjBWMmxrZEdnc1hHNGdJQ0FnSUNBZ0lISnBaMmgwT2lCeWFXZG9kRmRwWkhSb0xGeHVJQ0FnSUNBZ2ZTeGNiaUFnSUNCOU8xeHVYRzRnSUNBZ2RHaHBjeTVpYVc1a1JYWmxiblJ6S0Z4dUlDQWdJQ0FnZEdocGN5NGtiM2R1WlhKRWIyTjFiV1Z1ZEN4Y2JpQWdJQ0FnSUZzbmJXOTFjMlZ0YjNabEp5d2dKM1J2ZFdOb2JXOTJaU2RkTEZ4dUlDQWdJQ0FnZEdocGN5NXZibEJ2YVc1MFpYSk5iM1psTG1KcGJtUW9kR2hwY3lrc1hHNGdJQ0FnS1R0Y2JpQWdJQ0IwYUdsekxtSnBibVJGZG1WdWRITW9YRzRnSUNBZ0lDQjBhR2x6TGlSdmQyNWxja1J2WTNWdFpXNTBMRnh1SUNBZ0lDQWdXeWR0YjNWelpYVndKeXdnSjNSdmRXTm9aVzVrSjEwc1hHNGdJQ0FnSUNCMGFHbHpMbTl1VUc5cGJuUmxjbFZ3TG1KcGJtUW9kR2hwY3lrc1hHNGdJQ0FnS1R0Y2JseHVJQ0FnSUhSb2FYTXVKR2hoYm1Sc1pVTnZiblJoYVc1bGNpNWhaR1FvZEdocGN5NGtkR0ZpYkdVcExtRmtaRU5zWVhOektFTk1RVk5UWDFSQlFreEZYMUpGVTBsYVNVNUhLVHRjYmx4dUlDQWdJQ1JzWldaMFEyOXNkVzF1WEc0Z0lDQWdJQ0F1WVdSa0tDUnlhV2RvZEVOdmJIVnRiaWxjYmlBZ0lDQWdJQzVoWkdRb0pHTjFjbkpsYm5SSGNtbHdLVnh1SUNBZ0lDQWdMbUZrWkVOc1lYTnpLRU5NUVZOVFgwTlBURlZOVGw5U1JWTkpXa2xPUnlrN1hHNWNiaUFnSUNCMGFHbHpMblJ5YVdkblpYSkZkbVZ1ZENoY2JpQWdJQ0FnSUVWV1JVNVVYMUpGVTBsYVJWOVRWRUZTVkN4Y2JpQWdJQ0FnSUZza2JHVm1kRU52YkhWdGJpd2dKSEpwWjJoMFEyOXNkVzF1TENCc1pXWjBWMmxrZEdnc0lISnBaMmgwVjJsa2RHaGRMRnh1SUNBZ0lDQWdaWFpsYm5Rc1hHNGdJQ0FnS1R0Y2JseHVJQ0FnSUdWMlpXNTBMbkJ5WlhabGJuUkVaV1poZFd4MEtDazdYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdVRzlwYm5SbGNpOXRiM1Z6WlNCdGIzWmxiV1Z1ZENCb1lXNWtiR1Z5WEc1Y2JpQWdRRzFsZEdodlpDQnZibEJ2YVc1MFpYSk5iM1psWEc0Z0lFQndZWEpoYlNCbGRtVnVkQ0I3VDJKcVpXTjBmU0JGZG1WdWRDQnZZbXBsWTNRZ1lYTnpiMk5wWVhSbFpDQjNhWFJvSUhSb1pTQnBiblJsY21GamRHbHZibHh1SUNBcUtpOWNiaUFnYjI1UWIybHVkR1Z5VFc5MlpTaGxkbVZ1ZENrZ2UxeHVJQ0FnSUd4bGRDQnZjQ0E5SUhSb2FYTXViM0JsY21GMGFXOXVPMXh1SUNBZ0lHbG1JQ2doZEdocGN5NXZjR1Z5WVhScGIyNHBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJqdGNiaUFnSUNCOVhHNWNiaUFnSUNBdkx5QkVaWFJsY20xcGJtVWdkR2hsSUdSbGJIUmhJR05vWVc1blpTQmlaWFIzWldWdUlITjBZWEowSUdGdVpDQnVaWGNnYlc5MWMyVWdjRzl6YVhScGIyNHNJR0Z6SUdFZ2NHVnlZMlZ1ZEdGblpTQnZaaUIwYUdVZ2RHRmliR1VnZDJsa2RHaGNiaUFnSUNCc1pYUWdaR2xtWm1WeVpXNWpaU0E5WEc0Z0lDQWdJQ0FvS0hSb2FYTXVaMlYwVUc5cGJuUmxjbGdvWlhabGJuUXBJQzBnYjNBdWMzUmhjblJZS1NBdklIUm9hWE11SkhSaFlteGxMbmRwWkhSb0tDa3BJQ29nTVRBd08xeHVJQ0FnSUdsbUlDaGthV1ptWlhKbGJtTmxJRDA5UFNBd0tTQjdYRzRnSUNBZ0lDQnlaWFIxY200N1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnYkdWMElHeGxablJEYjJ4MWJXNGdQU0J2Y0M0a2JHVm1kRU52YkhWdGJsc3dYVHRjYmlBZ0lDQnNaWFFnY21sbmFIUkRiMngxYlc0Z1BTQnZjQzRrY21sbmFIUkRiMngxYlc1Yk1GMDdYRzRnSUNBZ2JHVjBJSGRwWkhSb1RHVm1kQ3dnZDJsa2RHaFNhV2RvZER0Y2JseHVJQ0FnSUdsbUlDaGthV1ptWlhKbGJtTmxJRDRnTUNrZ2UxeHVJQ0FnSUNBZ2QybGtkR2hNWldaMElEMGdkR2hwY3k1amIyNXpkSEpoYVc1WGFXUjBhQ2hjYmlBZ0lDQWdJQ0FnYjNBdWQybGtkR2h6TG14bFpuUWdLeUFvYjNBdWQybGtkR2h6TG5KcFoyaDBJQzBnYjNBdWJtVjNWMmxrZEdoekxuSnBaMmgwS1N4Y2JpQWdJQ0FnSUNrN1hHNGdJQ0FnSUNCM2FXUjBhRkpwWjJoMElEMGdkR2hwY3k1amIyNXpkSEpoYVc1WGFXUjBhQ2h2Y0M1M2FXUjBhSE11Y21sbmFIUWdMU0JrYVdabVpYSmxibU5sS1R0Y2JpQWdJQ0I5SUdWc2MyVWdhV1lnS0dScFptWmxjbVZ1WTJVZ1BDQXdLU0I3WEc0Z0lDQWdJQ0IzYVdSMGFFeGxablFnUFNCMGFHbHpMbU52Ym5OMGNtRnBibGRwWkhSb0tHOXdMbmRwWkhSb2N5NXNaV1owSUNzZ1pHbG1abVZ5Wlc1alpTazdYRzRnSUNBZ0lDQjNhV1IwYUZKcFoyaDBJRDBnZEdocGN5NWpiMjV6ZEhKaGFXNVhhV1IwYUNoY2JpQWdJQ0FnSUNBZ2IzQXVkMmxrZEdoekxuSnBaMmgwSUNzZ0tHOXdMbmRwWkhSb2N5NXNaV1owSUMwZ2IzQXVibVYzVjJsa2RHaHpMbXhsWm5RcExGeHVJQ0FnSUNBZ0tUdGNiaUFnSUNCOVhHNWNiaUFnSUNCcFppQW9iR1ZtZEVOdmJIVnRiaWtnZTF4dUlDQWdJQ0FnZEdocGN5NXpaWFJYYVdSMGFDaHNaV1owUTI5c2RXMXVMQ0IzYVdSMGFFeGxablFwTzF4dUlDQWdJSDFjYmlBZ0lDQnBaaUFvY21sbmFIUkRiMngxYlc0cElIdGNiaUFnSUNBZ0lIUm9hWE11YzJWMFYybGtkR2dvY21sbmFIUkRiMngxYlc0c0lIZHBaSFJvVW1sbmFIUXBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHOXdMbTVsZDFkcFpIUm9jeTVzWldaMElEMGdkMmxrZEdoTVpXWjBPMXh1SUNBZ0lHOXdMbTVsZDFkcFpIUm9jeTV5YVdkb2RDQTlJSGRwWkhSb1VtbG5hSFE3WEc1Y2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k1MGNtbG5aMlZ5UlhabGJuUW9YRzRnSUNBZ0lDQkZWa1ZPVkY5U1JWTkpXa1VzWEc0Z0lDQWdJQ0JiYjNBdUpHeGxablJEYjJ4MWJXNHNJRzl3TGlSeWFXZG9kRU52YkhWdGJpd2dkMmxrZEdoTVpXWjBMQ0IzYVdSMGFGSnBaMmgwWFN4Y2JpQWdJQ0FnSUdWMlpXNTBMRnh1SUNBZ0lDazdYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdVRzlwYm5SbGNpOXRiM1Z6WlNCeVpXeGxZWE5sSUdoaGJtUnNaWEpjYmx4dUlDQkFiV1YwYUc5a0lHOXVVRzlwYm5SbGNsVndYRzRnSUVCd1lYSmhiU0JsZG1WdWRDQjdUMkpxWldOMGZTQkZkbVZ1ZENCdlltcGxZM1FnWVhOemIyTnBZWFJsWkNCM2FYUm9JSFJvWlNCcGJuUmxjbUZqZEdsdmJseHVJQ0FxS2k5Y2JpQWdiMjVRYjJsdWRHVnlWWEFvWlhabGJuUXBJSHRjYmlBZ0lDQnNaWFFnYjNBZ1BTQjBhR2x6TG05d1pYSmhkR2x2Ymp0Y2JpQWdJQ0JwWmlBb0lYUm9hWE11YjNCbGNtRjBhVzl1S1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTQ3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdkR2hwY3k1MWJtSnBibVJGZG1WdWRITW9kR2hwY3k0a2IzZHVaWEpFYjJOMWJXVnVkQ3dnVzF4dUlDQWdJQ0FnSjIxdmRYTmxkWEFuTEZ4dUlDQWdJQ0FnSjNSdmRXTm9aVzVrSnl4Y2JpQWdJQ0FnSUNkdGIzVnpaVzF2ZG1VbkxGeHVJQ0FnSUNBZ0ozUnZkV05vYlc5MlpTY3NYRzRnSUNBZ1hTazdYRzVjYmlBZ0lDQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWEl1WVdSa0tIUm9hWE11SkhSaFlteGxLUzV5WlcxdmRtVkRiR0Z6Y3loRFRFRlRVMTlVUVVKTVJWOVNSVk5KV2tsT1J5azdYRzVjYmlBZ0lDQnZjQzRrYkdWbWRFTnZiSFZ0Ymx4dUlDQWdJQ0FnTG1Ga1pDaHZjQzRrY21sbmFIUkRiMngxYlc0cFhHNGdJQ0FnSUNBdVlXUmtLRzl3TGlSamRYSnlaVzUwUjNKcGNDbGNiaUFnSUNBZ0lDNXlaVzF2ZG1WRGJHRnpjeWhEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjcE8xeHVYRzRnSUNBZ2RHaHBjeTV6ZVc1alNHRnVaR3hsVjJsa2RHaHpLQ2s3WEc0Z0lDQWdkR2hwY3k1ellYWmxRMjlzZFcxdVYybGtkR2h6S0NrN1hHNWNiaUFnSUNCMGFHbHpMbTl3WlhKaGRHbHZiaUE5SUc1MWJHdzdYRzVjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTUwY21sbloyVnlSWFpsYm5Rb1hHNGdJQ0FnSUNCRlZrVk9WRjlTUlZOSldrVmZVMVJQVUN4Y2JpQWdJQ0FnSUZ0dmNDNGtiR1ZtZEVOdmJIVnRiaXdnYjNBdUpISnBaMmgwUTI5c2RXMXVMQ0J2Y0M1dVpYZFhhV1IwYUhNdWJHVm1kQ3dnYjNBdWJtVjNWMmxrZEdoekxuSnBaMmgwWFN4Y2JpQWdJQ0FnSUdWMlpXNTBMRnh1SUNBZ0lDazdYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdVbVZ0YjNabGN5QmhiR3dnWlhabGJuUWdiR2x6ZEdWdVpYSnpMQ0JrWVhSaExDQmhibVFnWVdSa1pXUWdSRTlOSUdWc1pXMWxiblJ6TGlCVVlXdGxjMXh1SUNCMGFHVWdQSFJoWW14bEx6NGdaV3hsYldWdWRDQmlZV05ySUhSdklHaHZkeUJwZENCM1lYTXNJR0Z1WkNCeVpYUjFjbTV6SUdsMFhHNWNiaUFnUUcxbGRHaHZaQ0JrWlhOMGNtOTVYRzRnSUVCeVpYUjFjbTRnZTJwUmRXVnllWDBnVDNKcFoybHVZV3dnYWxGMVpYSjVMWGR5WVhCd1pXUWdQSFJoWW14bFBpQmxiR1Z0Wlc1MFhHNGdJQ29xTDF4dUlDQmtaWE4wY205NUtDa2dlMXh1SUNBZ0lHeGxkQ0FrZEdGaWJHVWdQU0IwYUdsekxpUjBZV0pzWlR0Y2JpQWdJQ0JzWlhRZ0pHaGhibVJzWlhNZ1BTQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWEl1Wm1sdVpDZ25MaWNnS3lCRFRFRlRVMTlJUVU1RVRFVXBPMXh1WEc0Z0lDQWdkR2hwY3k1MWJtSnBibVJGZG1WdWRITW9YRzRnSUNBZ0lDQjBhR2x6TGlSM2FXNWtiM2N1WVdSa0tIUm9hWE11Skc5M2JtVnlSRzlqZFcxbGJuUXBMbUZrWkNoMGFHbHpMaVIwWVdKc1pTa3VZV1JrS0NSb1lXNWtiR1Z6S1N4Y2JpQWdJQ0FwTzF4dVhHNGdJQ0FnSkdoaGJtUnNaWE11Y21WdGIzWmxSR0YwWVNoRVFWUkJYMVJJS1R0Y2JpQWdJQ0FrZEdGaWJHVXVjbVZ0YjNabFJHRjBZU2hFUVZSQlgwRlFTU2s3WEc1Y2JpQWdJQ0IwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhJdWNtVnRiM1psS0NrN1hHNGdJQ0FnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeUlEMGdiblZzYkR0Y2JpQWdJQ0IwYUdsekxpUjBZV0pzWlVobFlXUmxjbk1nUFNCdWRXeHNPMXh1SUNBZ0lIUm9hWE11SkhSaFlteGxJRDBnYm5Wc2JEdGNibHh1SUNBZ0lISmxkSFZ5YmlBa2RHRmliR1U3WEc0Z0lIMWNibHh1SUNBdktpcGNiaUFnUW1sdVpITWdaMmwyWlc0Z1pYWmxiblJ6SUdadmNpQjBhR2x6SUdsdWMzUmhibU5sSUhSdklIUm9aU0JuYVhabGJpQjBZWEpuWlhRZ1JFOU5SV3hsYldWdWRGeHVYRzRnSUVCd2NtbDJZWFJsWEc0Z0lFQnRaWFJvYjJRZ1ltbHVaRVYyWlc1MGMxeHVJQ0JBY0dGeVlXMGdkR0Z5WjJWMElIdHFVWFZsY25sOUlHcFJkV1Z5ZVMxM2NtRndjR1ZrSUVSUFRVVnNaVzFsYm5RZ2RHOGdZbWx1WkNCbGRtVnVkSE1nZEc5Y2JpQWdRSEJoY21GdElHVjJaVzUwY3lCN1UzUnlhVzVuZkVGeWNtRjVmU0JGZG1WdWRDQnVZVzFsSUNodmNpQmhjbkpoZVNCdlppa2dkRzhnWW1sdVpGeHVJQ0JBY0dGeVlXMGdjMlZzWldOMGIzSlBja05oYkd4aVlXTnJJSHRUZEhKcGJtZDhSblZ1WTNScGIyNTlJRk5sYkdWamRHOXlJSE4wY21sdVp5QnZjaUJqWVd4c1ltRmphMXh1SUNCQWNHRnlZVzBnVzJOaGJHeGlZV05yWFNCN1JuVnVZM1JwYjI1OUlFTmhiR3hpWVdOcklHMWxkR2h2WkZ4dUlDQXFLaTljYmlBZ1ltbHVaRVYyWlc1MGN5Z2tkR0Z5WjJWMExDQmxkbVZ1ZEhNc0lITmxiR1ZqZEc5eVQzSkRZV3hzWW1GamF5d2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JR1YyWlc1MGN5QTlQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0FnSUdWMlpXNTBjeUE5SUdWMlpXNTBjeUFySUhSb2FYTXVibk03WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lHVjJaVzUwY3lBOUlHVjJaVzUwY3k1cWIybHVLSFJvYVhNdWJuTWdLeUFuSUNjcElDc2dkR2hwY3k1dWN6dGNiaUFnSUNCOVhHNWNiaUFnSUNCcFppQW9ZWEpuZFcxbGJuUnpMbXhsYm1kMGFDQStJRE1wSUh0Y2JpQWdJQ0FnSUNSMFlYSm5aWFF1YjI0b1pYWmxiblJ6TENCelpXeGxZM1J2Y2s5eVEyRnNiR0poWTJzc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSkhSaGNtZGxkQzV2YmlobGRtVnVkSE1zSUhObGJHVmpkRzl5VDNKRFlXeHNZbUZqYXlrN1hHNGdJQ0FnZlZ4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUZWdVltbHVaSE1nWlhabGJuUnpJSE53WldOcFptbGpJSFJ2SUhSb2FYTWdhVzV6ZEdGdVkyVWdabkp2YlNCMGFHVWdaMmwyWlc0Z2RHRnlaMlYwSUVSUFRVVnNaVzFsYm5SY2JseHVJQ0JBY0hKcGRtRjBaVnh1SUNCQWJXVjBhRzlrSUhWdVltbHVaRVYyWlc1MGMxeHVJQ0JBY0dGeVlXMGdkR0Z5WjJWMElIdHFVWFZsY25sOUlHcFJkV1Z5ZVMxM2NtRndjR1ZrSUVSUFRVVnNaVzFsYm5RZ2RHOGdkVzVpYVc1a0lHVjJaVzUwY3lCbWNtOXRYRzRnSUVCd1lYSmhiU0JsZG1WdWRITWdlMU4wY21sdVozeEJjbkpoZVgwZ1JYWmxiblFnYm1GdFpTQW9iM0lnWVhKeVlYa2diMllwSUhSdklIVnVZbWx1WkZ4dUlDQXFLaTljYmlBZ2RXNWlhVzVrUlhabGJuUnpLQ1IwWVhKblpYUXNJR1YyWlc1MGN5a2dlMXh1SUNBZ0lHbG1JQ2gwZVhCbGIyWWdaWFpsYm5SeklEMDlQU0FuYzNSeWFXNW5KeWtnZTF4dUlDQWdJQ0FnWlhabGJuUnpJRDBnWlhabGJuUnpJQ3NnZEdocGN5NXVjenRjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLR1YyWlc1MGN5QWhQU0J1ZFd4c0tTQjdYRzRnSUNBZ0lDQmxkbVZ1ZEhNZ1BTQmxkbVZ1ZEhNdWFtOXBiaWgwYUdsekxtNXpJQ3NnSnlBbktTQXJJSFJvYVhNdWJuTTdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUdWMlpXNTBjeUE5SUhSb2FYTXVibk03WEc0Z0lDQWdmVnh1WEc0Z0lDQWdKSFJoY21kbGRDNXZabVlvWlhabGJuUnpLVHRjYmlBZ2ZWeHVYRzRnSUM4cUtseHVJQ0JVY21sbloyVnljeUJoYmlCbGRtVnVkQ0J2YmlCMGFHVWdQSFJoWW14bEx6NGdaV3hsYldWdWRDQm1iM0lnWVNCbmFYWmxiaUIwZVhCbElIZHBkR2dnWjJsMlpXNWNiaUFnWVhKbmRXMWxiblJ6TENCaGJITnZJSE5sZEhScGJtY2dZVzVrSUdGc2JHOTNhVzVuSUdGalkyVnpjeUIwYnlCMGFHVWdiM0pwWjJsdVlXeEZkbVZ1ZENCcFpseHVJQ0JuYVhabGJpNGdVbVYwZFhKdWN5QjBhR1VnY21WemRXeDBJRzltSUhSb1pTQjBjbWxuWjJWeVpXUWdaWFpsYm5RdVhHNWNiaUFnUUhCeWFYWmhkR1ZjYmlBZ1FHMWxkR2h2WkNCMGNtbG5aMlZ5UlhabGJuUmNiaUFnUUhCaGNtRnRJSFI1Y0dVZ2UxTjBjbWx1WjMwZ1JYWmxiblFnYm1GdFpWeHVJQ0JBY0dGeVlXMGdZWEpuY3lCN1FYSnlZWGw5SUVGeWNtRjVJRzltSUdGeVozVnRaVzUwY3lCMGJ5QndZWE56SUhSb2NtOTFaMmhjYmlBZ1FIQmhjbUZ0SUZ0dmNtbG5hVzVoYkVWMlpXNTBYU0JKWmlCbmFYWmxiaXdnYVhNZ2MyVjBJRzl1SUhSb1pTQmxkbVZ1ZENCdlltcGxZM1JjYmlBZ1FISmxkSFZ5YmlCN1RXbDRaV1I5SUZKbGMzVnNkQ0J2WmlCMGFHVWdaWFpsYm5RZ2RISnBaMmRsY2lCaFkzUnBiMjVjYmlBZ0tpb3ZYRzRnSUhSeWFXZG5aWEpGZG1WdWRDaDBlWEJsTENCaGNtZHpMQ0J2Y21sbmFXNWhiRVYyWlc1MEtTQjdYRzRnSUNBZ2JHVjBJR1YyWlc1MElEMGdKQzVGZG1WdWRDaDBlWEJsS1R0Y2JpQWdJQ0JwWmlBb1pYWmxiblF1YjNKcFoybHVZV3hGZG1WdWRDa2dlMXh1SUNBZ0lDQWdaWFpsYm5RdWIzSnBaMmx1WVd4RmRtVnVkQ0E5SUNRdVpYaDBaVzVrS0h0OUxDQnZjbWxuYVc1aGJFVjJaVzUwS1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k0a2RHRmliR1V1ZEhKcFoyZGxjaWhsZG1WdWRDd2dXM1JvYVhOZExtTnZibU5oZENoaGNtZHpJSHg4SUZ0ZEtTazdYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdRMkZzWTNWc1lYUmxjeUJoSUhWdWFYRjFaU0JqYjJ4MWJXNGdTVVFnWm05eUlHRWdaMmwyWlc0Z1kyOXNkVzF1SUVSUFRVVnNaVzFsYm5SY2JseHVJQ0JBY0hKcGRtRjBaVnh1SUNCQWJXVjBhRzlrSUdkbGJtVnlZWFJsUTI5c2RXMXVTV1JjYmlBZ1FIQmhjbUZ0SUNSbGJDQjdhbEYxWlhKNWZTQnFVWFZsY25rdGQzSmhjSEJsWkNCamIyeDFiVzRnWld4bGJXVnVkRnh1SUNCQWNtVjBkWEp1SUh0VGRISnBibWQ5SUVOdmJIVnRiaUJKUkZ4dUlDQXFLaTljYmlBZ1oyVnVaWEpoZEdWRGIyeDFiVzVKWkNna1pXd3BJSHRjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTRrZEdGaWJHVXVaR0YwWVNoRVFWUkJYME5QVEZWTlRsTmZTVVFwSUNzZ0p5MG5JQ3NnSkdWc0xtUmhkR0VvUkVGVVFWOURUMHhWVFU1ZlNVUXBPMXh1SUNCOVhHNWNiaUFnTHlvcVhHNGdJRkJoY25ObGN5QmhJR2RwZG1WdUlFUlBUVVZzWlcxbGJuUW5jeUIzYVdSMGFDQnBiblJ2SUdFZ1pteHZZWFJjYmx4dUlDQkFjSEpwZG1GMFpWeHVJQ0JBYldWMGFHOWtJSEJoY25ObFYybGtkR2hjYmlBZ1FIQmhjbUZ0SUdWc1pXMWxiblFnZTBSUFRVVnNaVzFsYm5SOUlFVnNaVzFsYm5RZ2RHOGdaMlYwSUhkcFpIUm9JRzltWEc0Z0lFQnlaWFIxY200Z2UwNTFiV0psY24wZ1JXeGxiV1Z1ZENkeklIZHBaSFJvSUdGeklHRWdabXh2WVhSY2JpQWdLaW92WEc0Z0lIQmhjbk5sVjJsa2RHZ29aV3hsYldWdWRDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbGJHVnRaVzUwSUQ4Z2NHRnljMlZHYkc5aGRDaGxiR1Z0Wlc1MExuTjBlV3hsTG5kcFpIUm9MbkpsY0d4aFkyVW9KeVVuTENBbkp5a3BJRG9nTUR0Y2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNCVFpYUnpJSFJvWlNCd1pYSmpaVzUwWVdkbElIZHBaSFJvSUc5bUlHRWdaMmwyWlc0Z1JFOU5SV3hsYldWdWRGeHVYRzRnSUVCd2NtbDJZWFJsWEc0Z0lFQnRaWFJvYjJRZ2MyVjBWMmxrZEdoY2JpQWdRSEJoY21GdElHVnNaVzFsYm5RZ2UwUlBUVVZzWlcxbGJuUjlJRVZzWlcxbGJuUWdkRzhnYzJWMElIZHBaSFJvSUc5dVhHNGdJRUJ3WVhKaGJTQjNhV1IwYUNCN1RuVnRZbVZ5ZlNCWGFXUjBhQ3dnWVhNZ1lTQndaWEpqWlc1MFlXZGxMQ0IwYnlCelpYUmNiaUFnS2lvdlhHNGdJSE5sZEZkcFpIUm9LR1ZzWlcxbGJuUXNJSGRwWkhSb0tTQjdYRzRnSUNBZ2QybGtkR2dnUFNCM2FXUjBhQzUwYjBacGVHVmtLRElwTzF4dUlDQWdJSGRwWkhSb0lEMGdkMmxrZEdnZ1BpQXdJRDhnZDJsa2RHZ2dPaUF3TzF4dUlDQWdJR1ZzWlcxbGJuUXVjM1I1YkdVdWQybGtkR2dnUFNCM2FXUjBhQ0FySUNjbEp6dGNiaUFnZlZ4dVhHNGdJQzhxS2x4dUlDQkRiMjV6ZEhKaGFXNXpJR0VnWjJsMlpXNGdkMmxrZEdnZ2RHOGdkR2hsSUcxcGJtbHRkVzBnWVc1a0lHMWhlR2x0ZFcwZ2NtRnVaMlZ6SUdSbFptbHVaV1FnYVc1Y2JpQWdkR2hsSUdCdGFXNVhhV1IwYUdBZ1lXNWtJR0J0WVhoWGFXUjBhR0FnWTI5dVptbG5kWEpoZEdsdmJpQnZjSFJwYjI1ekxDQnlaWE53WldOMGFYWmxiSGt1WEc1Y2JpQWdRSEJ5YVhaaGRHVmNiaUFnUUcxbGRHaHZaQ0JqYjI1emRISmhhVzVYYVdSMGFGeHVJQ0JBY0dGeVlXMGdkMmxrZEdnZ2UwNTFiV0psY24wZ1YybGtkR2dnZEc4Z1kyOXVjM1J5WVdsdVhHNGdJRUJ5WlhSMWNtNGdlMDUxYldKbGNuMGdRMjl1YzNSeVlXbHVaV1FnZDJsa2RHaGNiaUFnS2lvdlhHNGdJR052Ym5OMGNtRnBibGRwWkhSb0tIZHBaSFJvS1NCN1hHNGdJQ0FnYVdZZ0tIUm9hWE11YjNCMGFXOXVjeTV0YVc1WGFXUjBhQ0FoUFNCMWJtUmxabWx1WldRcElIdGNiaUFnSUNBZ0lIZHBaSFJvSUQwZ1RXRjBhQzV0WVhnb2RHaHBjeTV2Y0hScGIyNXpMbTFwYmxkcFpIUm9MQ0IzYVdSMGFDazdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2FXWWdLSFJvYVhNdWIzQjBhVzl1Y3k1dFlYaFhhV1IwYUNBaFBTQjFibVJsWm1sdVpXUXBJSHRjYmlBZ0lDQWdJSGRwWkhSb0lEMGdUV0YwYUM1dGFXNG9kR2hwY3k1dmNIUnBiMjV6TG0xaGVGZHBaSFJvTENCM2FXUjBhQ2s3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdjbVYwZFhKdUlIZHBaSFJvTzF4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUVkcGRtVnVJR0VnY0dGeWRHbGpkV3hoY2lCRmRtVnVkQ0J2WW1wbFkzUXNJSEpsZEhKcFpYWmxjeUIwYUdVZ1kzVnljbVZ1ZENCd2IybHVkR1Z5SUc5bVpuTmxkQ0JoYkc5dVoxeHVJQ0IwYUdVZ2FHOXlhWHB2Ym5SaGJDQmthWEpsWTNScGIyNHVJRUZqWTI5MWJuUnpJR1p2Y2lCaWIzUm9JSEpsWjNWc1lYSWdiVzkxYzJVZ1kyeHBZMnR6SUdGeklIZGxiR3dnWVhOY2JpQWdjRzlwYm5SbGNpMXNhV3RsSUhONWMzUmxiWE1nS0cxdlltbHNaWE1zSUhSaFlteGxkSE1nWlhSakxpbGNibHh1SUNCQWNISnBkbUYwWlZ4dUlDQkFiV1YwYUc5a0lHZGxkRkJ2YVc1MFpYSllYRzRnSUVCd1lYSmhiU0JsZG1WdWRDQjdUMkpxWldOMGZTQkZkbVZ1ZENCdlltcGxZM1FnWVhOemIyTnBZWFJsWkNCM2FYUm9JSFJvWlNCcGJuUmxjbUZqZEdsdmJseHVJQ0JBY21WMGRYSnVJSHRPZFcxaVpYSjlJRWh2Y21sNmIyNTBZV3dnY0c5cGJuUmxjaUJ2Wm1aelpYUmNiaUFnS2lvdlhHNGdJR2RsZEZCdmFXNTBaWEpZS0dWMlpXNTBLU0I3WEc0Z0lDQWdhV1lnS0dWMlpXNTBMblI1Y0dVdWFXNWtaWGhQWmlnbmRHOTFZMmduS1NBOVBUMGdNQ2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJQ2hjYmlBZ0lDQWdJQ0FnWlhabGJuUXViM0pwWjJsdVlXeEZkbVZ1ZEM1MGIzVmphR1Z6V3pCZElIeDhJR1YyWlc1MExtOXlhV2RwYm1Gc1JYWmxiblF1WTJoaGJtZGxaRlJ2ZFdOb1pYTmJNRjFjYmlBZ0lDQWdJQ2t1Y0dGblpWZzdYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUJsZG1WdWRDNXdZV2RsV0R0Y2JpQWdmVnh1ZlZ4dVhHNVNaWE5wZW1GaWJHVkRiMngxYlc1ekxtUmxabUYxYkhSeklEMGdlMXh1SUNCelpXeGxZM1J2Y2pvZ1puVnVZM1JwYjI0Z0tDUjBZV0pzWlNrZ2UxeHVJQ0FnSUdsbUlDZ2tkR0ZpYkdVdVptbHVaQ2duZEdobFlXUW5LUzVzWlc1bmRHZ3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQlRSVXhGUTFSUFVsOVVTRHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQnlaWFIxY200Z1UwVk1SVU5VVDFKZlZFUTdYRzRnSUgwc1hHNGdJSE4wYjNKbE9pQjNhVzVrYjNjdWMzUnZjbVVzWEc0Z0lITjVibU5JWVc1a2JHVnljem9nZEhKMVpTeGNiaUFnY21WemFYcGxSbkp2YlVKdlpIazZJSFJ5ZFdVc1hHNGdJRzFoZUZkcFpIUm9PaUJ1ZFd4c0xGeHVJQ0J0YVc1WGFXUjBhRG9nTUM0d01TeGNibjA3WEc1Y2JsSmxjMmw2WVdKc1pVTnZiSFZ0Ym5NdVkyOTFiblFnUFNBd08xeHVJaXdpWlhod2IzSjBJR052Ym5OMElFUkJWRUZmUVZCSklEMGdKM0psYzJsNllXSnNaVU52YkhWdGJuTW5PMXh1Wlhod2IzSjBJR052Ym5OMElFUkJWRUZmUTA5TVZVMU9VMTlKUkNBOUlDZHlaWE5wZW1GaWJHVXRZMjlzZFcxdWN5MXBaQ2M3WEc1bGVIQnZjblFnWTI5dWMzUWdSRUZVUVY5RFQweFZUVTVmU1VRZ1BTQW5jbVZ6YVhwaFlteGxMV052YkhWdGJpMXBaQ2M3WEc1bGVIQnZjblFnWTI5dWMzUWdSRUZVUVY5VVNDQTlJQ2QwYUNjN1hHNWNibVY0Y0c5eWRDQmpiMjV6ZENCRFRFRlRVMTlVUVVKTVJWOVNSVk5KV2tsT1J5QTlJQ2R5WXkxMFlXSnNaUzF5WlhOcGVtbHVaeWM3WEc1bGVIQnZjblFnWTI5dWMzUWdRMHhCVTFOZlEwOU1WVTFPWDFKRlUwbGFTVTVISUQwZ0ozSmpMV052YkhWdGJpMXlaWE5wZW1sdVp5YzdYRzVsZUhCdmNuUWdZMjl1YzNRZ1EweEJVMU5mU0VGT1JFeEZJRDBnSjNKakxXaGhibVJzWlNjN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnUTB4QlUxTmZTRUZPUkV4RlgwTlBUbFJCU1U1RlVpQTlJQ2R5WXkxb1lXNWtiR1V0WTI5dWRHRnBibVZ5Snp0Y2JseHVaWGh3YjNKMElHTnZibk4wSUVWV1JVNVVYMUpGVTBsYVJWOVRWRUZTVkNBOUlDZGpiMngxYlc0NmNtVnphWHBsT25OMFlYSjBKenRjYm1WNGNHOXlkQ0JqYjI1emRDQkZWa1ZPVkY5U1JWTkpXa1VnUFNBblkyOXNkVzF1T25KbGMybDZaU2M3WEc1bGVIQnZjblFnWTI5dWMzUWdSVlpGVGxSZlVrVlRTVnBGWDFOVVQxQWdQU0FuWTI5c2RXMXVPbkpsYzJsNlpUcHpkRzl3Snp0Y2JseHVaWGh3YjNKMElHTnZibk4wSUZORlRFVkRWRTlTWDFSSUlEMGdKM1J5T21acGNuTjBJRDRnZEdnNmRtbHphV0pzWlNjN1hHNWxlSEJ2Y25RZ1kyOXVjM1FnVTBWTVJVTlVUMUpmVkVRZ1BTQW5kSEk2Wm1seWMzUWdQaUIwWkRwMmFYTnBZbXhsSnp0Y2JtVjRjRzl5ZENCamIyNXpkQ0JUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNBOUlHQmJaR0YwWVMxdWIzSmxjMmw2WlYxZ08xeHVJaXdpYVcxd2IzSjBJRkpsYzJsNllXSnNaVU52YkhWdGJuTWdabkp2YlNBbkxpOWpiR0Z6Y3ljN1hHNXBiWEJ2Y25RZ1lXUmhjSFJsY2lCbWNtOXRJQ2N1TDJGa1lYQjBaWEluTzF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCU1pYTnBlbUZpYkdWRGIyeDFiVzV6T3lKZGZRPT0ifQ==
