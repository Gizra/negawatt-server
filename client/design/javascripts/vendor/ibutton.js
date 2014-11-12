/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */
;
/*
 * Metadata - jQuery plugin for parsing metadata from elements
 *
 * Copyright (c) 2006 John Resig, Yehuda Katz, J�örn Zaefferer, Paul McLanahan
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 *
 */

/**
 * Sets the type of metadata to use. Metadata is encoded in JSON, and each property
 * in the JSON will become a property of the element itself.
 *
 * There are three supported types of metadata storage:
 *
 *   attr:  Inside an attribute. The name parameter indicates *which* attribute.
 *          
 *   class: Inside the class attribute, wrapped in curly braces: { }
 *   
 *   elem:  Inside a child element (e.g. a script tag). The
 *          name parameter indicates *which* element.
 *          
 * The metadata for an element is loaded the first time the element is accessed via jQuery.
 *
 * As a result, you can define the metadata type, use $(expr) to load the metadata into the elements
 * matched by expr, then redefine the metadata type and run another $(expr) for other elements.
 * 
 * @name $.metadata.setType
 *
 * @example <p id="one" class="some_class {item_id: 1, item_label: 'Label'}">This is a p</p>
 * @before $.metadata.setType("class")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from the class attribute
 * 
 * @example <p id="one" class="some_class" data="{item_id: 1, item_label: 'Label'}">This is a p</p>
 * @before $.metadata.setType("attr", "data")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a "data" attribute
 * 
 * @example <p id="one" class="some_class"><script>{item_id: 1, item_label: 'Label'}</script>This is a p</p>
 * @before $.metadata.setType("elem", "script")
 * @after $("#one").metadata().item_id == 1; $("#one").metadata().item_label == "Label"
 * @desc Reads metadata from a nested script element
 * 
 * @param String type The encoding type
 * @param String name The name of the attribute to be used to get metadata (optional)
 * @cat Plugins/Metadata
 * @descr Sets the type of encoding to be used when loading metadata for the first time
 * @type undefined
 * @see metadata()
 */


(function($) {

$.extend({
	metadata : {
		defaults : {
			type: 'class',
			name: 'metadata',
			cre: /({.*})/,
			single: 'metadata'
		},
		setType: function( type, name ){
			this.defaults.type = type;
			this.defaults.name = name;
		},
		get: function( elem, opts ){
			var settings = $.extend({},this.defaults,opts);
			// check for empty string in single property
			if ( !settings.single.length ) settings.single = 'metadata';
			
			var data = $.data(elem, settings.single);
			// returned cached data if it already exists
			if ( data ) return data;
			
			data = "{}";
			
			if ( settings.type == "class" ) {
				var m = settings.cre.exec( elem.className );
				if ( m )
					data = m[1];
			} else if ( settings.type == "elem" ) {
				if( !elem.getElementsByTagName )
					return undefined;
				var e = elem.getElementsByTagName(settings.name);
				if ( e.length )
					data = $.trim(e[0].innerHTML);
			} else if ( elem.getAttribute != undefined ) {
				var attr = elem.getAttribute( settings.name );
				if ( attr )
					data = attr;
			}
			
			if ( data.indexOf( '{' ) <0 )
			data = "{" + data + "}";
			
			data = eval("(" + data + ")");
			
			$.data( elem, settings.single, data );
			return data;
		}
	}
});

/**
 * Returns the metadata object for the first member of the jQuery object.
 *
 * @name metadata
 * @descr Returns element's metadata object
 * @param Object opts An object contianing settings to override the defaults
 * @type jQuery
 * @cat Plugins/Metadata
 */
$.fn.metadata = function( opts ){
	return $.metadata.get( this[0], opts );
};

})(jQuery);
/*!
 * iButton jQuery Plug-in
 *
 * Copyright 2011 Giva, Inc. (http://www.givainc.com/labs/) 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * 	http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Date: 2011-07-26
 * Rev:  1.0.03
 */

;(function($){
	// set default options
	$.iButton = {
		version: "1.0.03",
		setDefaults: function(options){
			$.extend(defaults, options);
		}
	};
	
	$.fn.iButton = function(options) {
		var method = typeof arguments[0] == "string" && arguments[0];
		var args = method && Array.prototype.slice.call(arguments, 1) || arguments;
		// get a reference to the first iButton found
		var self = (this.length == 0) ? null : $.data(this[0], "iButton");
		
		// if a method is supplied, execute it for non-empty results
		if( self && method && this.length ){

			// if request a copy of the object, return it			
			if( method.toLowerCase() == "object" ) return self;
			// if method is defined, run it and return either it's results or the chain
			else if( self[method] ){
				// define a result variable to return to the jQuery chain
				var result;
				this.each(function (i){
					// apply the method to the current element
					var r = $.data(this, "iButton")[method].apply(self, args);
					// if first iteration we need to check if we're done processing or need to add it to the jquery chain
					if( i == 0 && r ){
						// if this is a jQuery item, we need to store them in a collection
						if( !!r.jquery ){
							result = $([]).add(r);
						// otherwise, just store the result and stop executing
						} else {
							result = r;
							// since we're a non-jQuery item, just cancel processing further items
							return false;
						}
					// keep adding jQuery objects to the results
					} else if( !!r && !!r.jquery ){
						result = result.add(r);
					}
				});

				// return either the results (which could be a jQuery object) or the original chain
				return result || this;
			// everything else, return the chain
			} else return this;
		// initializing request (only do if iButton not already initialized)
		} else {
			// create a new iButton for each object found
			return this.each(function (){
				new iButton(this, options);
			});
		};
	};

	// count instances	
	var counter = 0;
	// detect iPhone
	var iButton = function (input, options){
		var self = this
			, $input = $(input)
			, id = ++counter
			, disabled = false
			, width = {}
			, mouse = {dragging: false, clicked: null}
			, dragStart = {position: null, offset: null, time: null }
			// make a copy of the options and use the metadata if provided
			, options = $.extend({}, defaults, options, (!!$.metadata ? $input.metadata() : {}))
			// check to see if we're using the default labels
			, bDefaultLabelsUsed = (options.labelOn == ON && options.labelOff == OFF)
			// set valid field types
			, allow = ":checkbox, :radio";

		// only do for checkboxes buttons, if matches inside that node
    if( !$input.is(allow) ) return $input.find(allow).iButton(options);
		// if iButton already exists, stop processing
		else if($.data($input[0], "iButton") ) return;

		// store a reference to this marquee
		$.data($input[0], "iButton", self);
		
		// if using the "auto" setting, then don't resize handle or container if using the default label (since we'll trust the CSS)
		if( options.resizeHandle == "auto" ) options.resizeHandle = !bDefaultLabelsUsed;
		if( options.resizeContainer == "auto" ) options.resizeContainer = !bDefaultLabelsUsed;
		
		// toggles the state of a button (or can turn on/off)
		this.toggle = function (t){
			var toggle = (arguments.length > 0) ? t : !$input[0].checked;
			$input.prop("checked", toggle).trigger("change");
		};
		
		// disable/enable the control
		this.disable = function (t){
			var toggle = (arguments.length > 0) ? t : !disabled;
			// mark the control disabled
			disabled = toggle;
			// mark the input disabled
			$input.attr("disabled", toggle);
			// set the diabled styles
			$container[toggle ? "addClass" : "removeClass"](options.classDisabled);
			// run callback
			if( $.isFunction(options.disable) ) options.disable.apply(self, [disabled, $input, options]);
		};
		
		// repaint the button
		this.repaint = function (){
			positionHandle();
		};
		
		// this will destroy the iButton style
		this.destroy = function (){
			// remove behaviors
			$([$input[0], $container[0]]).unbind(".iButton");
			$(document).unbind(".iButton_" + id);
			// move the checkbox to it's original location
			$container.after($input).remove();
			// kill the reference
			$.data($input[0], "iButton", null);
			// run callback
			if( $.isFunction(options.destroy) ) options.destroy.apply(self, [$input, options]);
		};

    $input
			// create the wrapper code
			.wrap('<div class="' + $.trim(options.classContainer + ' ' + options.className) + '" />')
    	.after(
				  '<div class="' + options.classHandle + '"><div class="' + options.classHandleRight + '"><div class="' + options.classHandleMiddle + '" /></div></div>'
      	+ '<div class="' + options.classLabelOff + '"><span><label>'+ options.labelOff + '</label></span></div>'
      	+ '<div class="' + options.classLabelOn + '"><span><label>' + options.labelOn   + '</label></span></div>'
      	+ '<div class="' + options.classPaddingLeft + '"></div><div class="' + options.classPaddingRight + '"></div>'
			);

    var $container = $input.parent()
			, $handle    = $input.siblings("." + options.classHandle)
			, $offlabel  = $input.siblings("." + options.classLabelOff)
			, $offspan   = $offlabel.children("span")
			, $onlabel   = $input.siblings("." + options.classLabelOn)
			, $onspan    = $onlabel.children("span");


		// if we need to do some resizing, get the widths only once
		if( options.resizeHandle || options.resizeContainer ){
			width.onspan = $onspan.outerWidth();
			width.offspan = $offspan.outerWidth();
		}
			
		// automatically resize the handle
        if( options.resizeHandle ){
            if (options.handleWidth) {
                width.handle = options.handleWidth;
            } else {
                if (width.onspan > 0) {
                    width.handle = Math.min(width.onspan, width.offspan);
                } else {
                    width.handle = width.offspan;
                }
            }
			$handle.css("width", width.handle);
		} else {
			width.handle = $handle.width();
		}

    // automatically resize the control
		if( options.resizeContainer ){
			width.container = (Math.max(width.onspan, width.offspan) + width.handle + 10);
			$container.css("width", width.container);
			// adjust the off label to match the new container size
			$offlabel.css("width", width.container - 5);
		} else {
			width.container = $container.width() + 3;
            console.log(width.container);
		}

		var handleRight = width.container - width.handle - 5;
    
		var positionHandle = function (animate){
			var checked = $input[0].checked
				, x = (checked) ? handleRight : 0
				, animate = (arguments.length > 0) ? arguments[0] : true;

			if( animate && options.enableFx ){
				$handle.stop().animate({left: x}, options.duration, options.easing);
				$onlabel.stop().animate({width: x + 4}, options.duration, options.easing);
				$onspan.stop().animate({marginLeft: x - handleRight}, options.duration, options.easing);
				$offspan.stop().animate({marginRight: -x}, options.duration, options.easing);
			} else {
				$handle.css("left", x);
				$onlabel.css("width", x + 4);
				$onspan.css("marginLeft", x - handleRight);
				$offspan.css("marginRight", -x);
			}
		};

		// place the buttons in their default location	
		positionHandle(false);
		
		var getDragPos = function(e){
			return e.pageX || ((e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].pageX : 0);
		};

		// monitor mouse clicks in the container
		$container.bind("mousedown.iButton touchstart.iButton", function(e) {
			// abort if disabled or allow clicking the input to toggle the status (if input is visible)
			if( $(e.target).is(allow) || disabled || (!options.allowRadioUncheck && $input.is(":radio:checked")) ) return;
			
			e.preventDefault();
			mouse.clicked = $handle;
			dragStart.position = getDragPos(e);
			dragStart.offset = dragStart.position - (parseInt($handle.css("left"), 10) || 0);
			dragStart.time = (new Date()).getTime();
			return false;
		});

		// make sure dragging support is enabled		
		if( options.enableDrag ){
			// monitor mouse movement on the page
			$(document).bind("mousemove.iButton_" + id + " touchmove.iButton_" + id, function(e) {
				// if we haven't clicked on the container, cancel event
				if( mouse.clicked != $handle ){ return }
				e.preventDefault();
				
				var x = getDragPos(e);
				if( x != dragStart.offset ){
					mouse.dragging = true;
					$container.addClass(options.classHandleActive);
				}
	
				// make sure number is between 0 and 1			
				var pct = Math.min(1, Math.max(0, (x - dragStart.offset) / handleRight));
				
				$handle.css("left", pct * handleRight);
				$onlabel.css("width", pct * handleRight + 4);
				$offspan.css("marginRight", -pct * handleRight);
				$onspan.css("marginLeft", -(1 - pct) * handleRight);
				
				return false;
			});
		}
    
		// monitor when the mouse button is released
		$(document).bind("mouseup.iButton_" + id + " touchend.iButton_" + id, function(e) {
			if( mouse.clicked != $handle ){ return false }
			e.preventDefault();

			// track if the value has changed			
			var changed = true;

			// if not dragging or click time under a certain millisecond, then just toggle			
			if( !mouse.dragging || (((new Date()).getTime() - dragStart.time) < options.clickOffset ) ){
				var checked = $input[0].checked;
				$input.prop("checked", !checked);

				// run callback
				if( $.isFunction(options.click) ) options.click.apply(self, [!checked, $input, options]);
			} else {
				var x = getDragPos(e);
				
				var pct = (x - dragStart.offset) / handleRight;
				var checked = (pct >= 0.5);
				
				// if the value is the same, don't run change event
				if( $input[0].checked == checked ) changed = false;

				$input.prop("checked", checked);
			}
			
			// remove the active handler class			
			$container.removeClass(options.classHandleActive);
			mouse.clicked =  null;
			mouse.dragging = null;
			// run any change event for the element
			if( changed ) $input.trigger("change");
			// if the value didn't change, just reset the handle
			else positionHandle();
			
			return false;
		});
		
		// animate when we get a change event
		$input
			.bind("change.iButton", function (){
				// move handle
				positionHandle();

				// if a radio element, then we must repaint the other elements in it's group to show them as not selected
				if( $input.is(":radio") ){
					var el = $input[0];
	
					// try to use the DOM to get the grouped elements, but if not in a form get by name attr
					var $radio = $(el.form ? el.form[el.name] : ":radio[name=" + el.name + "]");

					// repaint the radio elements that are not checked	
					$radio.filter(":not(:checked)").iButton("repaint");
				}

				// run callback
				if( $.isFunction(options.change) ) options.change.apply(self, [$input, options]);
			})
			// if the element has focus, we need to highlight the container
			.bind("focus.iButton", function (){
				$container.addClass(options.classFocus);
			})
			// if the element has focus, we need to highlight the container
			.bind("blur.iButton", function (){
				$container.removeClass(options.classFocus);
			});

		// if a click event is registered, we must register on the checkbox so it's fired if triggered on the checkbox itself
		if( $.isFunction(options.click) ){
			$input.bind("click.iButton", function (){
				options.click.apply(self, [$input[0].checked, $input, options]);
			});
		}

		// if the field is disabled, mark it as such
		if( $input.is(":disabled") ) this.disable(true);
		
		// run the init callback
		if( $.isFunction(options.init) ) options.init.apply(self, [$input, options]);
	};

	var defaults = {
		  duration: 200                           // the speed of the animation
		, easing: "swing"                         // the easing animation to use
		, labelOn: "ON"                           // the text to show when toggled on
		, labelOff: "OFF"                         // the text to show when toggled off
		, resizeHandle: "auto"                    // determines if handle should be resized
		, resizeContainer: "auto"                 // determines if container should be resized
		, enableDrag: true                        // determines if we allow dragging
		, enableFx: true                          // determines if we show animation
		, allowRadioUncheck: false                // determine if a radio button should be able to be unchecked
		, clickOffset: 120                        // if millseconds between a mousedown & mouseup event this value, then considered a mouse click
        , handleWidth: 30

		// define the class statements
		, className:         ""
		, classContainer:    "ibutton-container"
		, classDisabled:     "ibutton-disabled"
		, classFocus:        "ibutton-focus"
		, classLabelOn:      "ibutton-label-on"
		, classLabelOff:     "ibutton-label-off"
		, classHandle:       "ibutton-handle"
		, classHandleMiddle: "ibutton-handle-middle"
		, classHandleRight:  "ibutton-handle-right"
		, classHandleActive: "ibutton-active-handle"
		, classPaddingLeft:  "ibutton-padding-left"
		, classPaddingRight: "ibutton-padding-right"

		// event handlers
		, init: null                              // callback that occurs when a iButton is initialized
		, change: null                            // callback that occurs when the button state is changed
		, click: null                             // callback that occurs when the button is clicked
		, disable: null                           // callback that occurs when the button is disabled/enabled
		, destroy: null                           // callback that occurs when the button is destroyed
	}, ON = defaults.labelOn, OFF = defaults.labelOff;

})(jQuery);



