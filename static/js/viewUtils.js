define([
], function() {

	function _parse(value, total) {
		if (typeof value === "number") {
            return value;
        }
		if (typeof value === "string") {
			if (value.indexOf("%") === -1) {
				return +value.replace("px", "");
            }
			return total * value.replace("%", "") / 100;
		} else {
			return 0;
		}
	}
	var self = {
		/**
		 * parses number of pixels from css string representation
		 * of horizontal size or distance
		 * @param value - number or string (e.g. 100, "50px", "30%")
		 */
		parseX: function(value) {
			return _parse(value, jQuery(window).width());
		},
		/**
		 * parses number of pixels from css string representation
		 * of vertical size or distance
		 * @param value - number or string (e.g. 100, "50px", "30%")
		 */
		parseY: function(value) {
			return _parse(value, jQuery(window).height());
		},
		/**
		 * gets element's top and left position
		 * @param element - string or Node or jQuery element
		 */
		getPosition: function(element) {
			var hidden = false;
			if (!jQuery(element).is(":visible")) {
				hidden = true;
				jQuery(element).show();
			}
			var result = jQuery(element).position();
			if (hidden) {
                jQuery(element).hide();
            }
			return result;
		},
		/**
		 * gets elements offset in current viewport
		 * @param element - string, Node or jQuery element
		 */
		getOffset: function(element) {
			var hidden = false;
			if (!jQuery(element).is(":visible")) {
				hidden = true;
				jQuery(element).show();
			}
			var result = jQuery(element).offset();
			result.left -= jQuery(window).scrollLeft();
            result.top -= jQuery(window).scrollTop();
			if (hidden) {
                jQuery(element).hide();
            }
			return result;
		},
		/**
		 * gets element's width and height
		 * @param element - string or Node or jQuery element
		 */
		getSize: function(element) {
			var hidden = false;
			if (!jQuery(element).is(":visible")) {
				hidden = true;
				jQuery(element).show();
			}
			var result = { width: jQuery(element).width(), height: jQuery(element).height() };
			if (hidden) {
                jQuery(element).hide();
            }
			return result;
		},
		/**
		 * gets element's min-width and min-height
		 * @param element - string or Node or jQuery element
		 */
		getMinSize: function(element) {
			return {
				"min-width": self.parseY(jQuery(element).css("min-width")),
				"min-height": self.parseX(jQuery(element).css("min-height"))
			};
		},
		/**
		 * gets element's max-width and max-height
		 * @param element - string or Node or jQuery element
		 */
		getMaxSize: function(element) {
			return {
				"max-width": self.parseY(jQuery(element).css("max-width")),
				"max-height": self.parseX(jQuery(element).css("max-height"))
			};
		},
		/**
		 * gets element's top, left, width and height parameters in number format
		 * @param element - string or Node or jQuery element
		 */
		getBox: function(element) {
			var notVisible = false;
			if (!jQuery(element).is(":visible") || jQuery(element).css("display") === "none") {
				notVisible = true;
            }
            var forceHide = /display\s*?:\s*?none/.test(jQuery(element).attr("style"));

			if (notVisible) {
                jQuery(element).show();
            }

			var result = jQuery(element).offset() || { left: 0, top: 0 };
			result.left -= jQuery(window).scrollLeft();
            result.top -= jQuery(window).scrollTop();
			result.width = jQuery(element).width();
            result.height = jQuery(element).height();

			if (forceHide) {
                jQuery(element).hide();
            } else {
                jQuery(element).css("display", "");
            }
			return result;
		},
		getBoundingBox: function(element, force) {
			if (!jQuery(element).is(":visible") && jQuery(element).css("display") !== "block") {
                if (force) {
                    jQuery(element).show();
                } else {
                    return {top: 0, left: 0, width: 0, height: 0};
                }
            }

			var padding = {
				left: parseInt(jQuery(element).css('padding-left'), 10),
				right: parseInt(jQuery(element).css('padding-right'), 10),
				top: parseInt(jQuery(element).css('padding-top'), 10),
				bottom: parseInt(jQuery(element).css('padding-bottom'), 10)
			};
			for (var o in padding) {
				if (padding[o] !== padding[o]) {
                    padding[o] = 0;
                }
			}
			var border = {
				left: parseInt(jQuery(element).css('border-left-width'), 10),
				right: parseInt(jQuery(element).css('border-right-width'), 10),
				top: parseInt(jQuery(element).css('border-top-width'), 10),
				bottom: parseInt(jQuery(element).css('border-bottom-width'), 10)
			};
			for (o in border) {
				if (border[o] !== border[o]) {
                    border[o] = 0;
                }
			}

			var result = jQuery(element).offset();

			result.width = jQuery(element).width() + padding.left + padding.right + border.left + border.right;
            result.height = jQuery(element).height() + padding.top + padding.bottom + border.top + border.bottom;

			return result;

		},
		getIndents: function(element) {
			if (typeof element === "string") {
				element = jQuery(element);
			}
			return {
				padding: {
					left: parseInt(element.css('padding-left'), 10) ? parseInt(element.css('padding-left'), 10) : 0,
					right: parseInt(element.css('padding-right'), 10) ? parseInt(element.css('padding-right'), 10) : 0,
					top: parseInt(element.css('padding-top'), 10) ? parseInt(element.css('padding-top'), 10) : 0,
					bottom: parseInt(element.css('padding-bottom'), 10) ? parseInt(element.css('padding-bottom'), 10) : 0
				},
				border: {
					left: parseInt(element.css('border-left-width'), 10) ? parseInt(element.css('border-left-width'), 10) : 0,
					right: parseInt(jQuery(element).css('border-right-width'), 10) ? parseInt(jQuery(element).css('border-right-width'), 10) : 0,
					top: parseInt(jQuery(element).css('border-top-width'), 10) ? parseInt(jQuery(element).css('border-top-width'), 10) : 0,
					bottom: parseInt(jQuery(element).css('border-bottom-width'), 10) ? parseInt(jQuery(element).css('border-bottom-width'), 10) : 0

                }
			};
		}
	};

	return self;
});

