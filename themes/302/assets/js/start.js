(function ($) {
    var
        defaults = {
            className: 'autosizejs',
            append: '',
            callback: false,
            resizeDelay: 10,
            placeholder: true
        },

    // border:0 is unnecessary, but avoids a bug in Firefox on OSX
        copy = '<textarea tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"/>',

    // line-height is conditionally included because IE7/IE8/old Opera do not return the correct value.
        typographyStyles = [
            'fontFamily',
            'fontSize',
            'fontWeight',
            'fontStyle',
            'letterSpacing',
            'textTransform',
            'wordSpacing',
            'textIndent'
        ],

    // to keep track which textarea is being mirrored when adjust() is called.
        mirrored,

    // the mirror element, which is used to calculate what size the mirrored element should be.
        mirror = $(copy).data('autosize', true)[0];

    // test that line-height can be accurately copied.
    mirror.style.lineHeight = '99px';
    if ($(mirror).css('lineHeight') === '99px') {
        typographyStyles.push('lineHeight');
    }
    mirror.style.lineHeight = '';

    $.fn.autosize = function (options) {
        if (!this.length) {
            return this;
        }

        options = $.extend({}, defaults, options || {});

        if (mirror.parentNode !== document.body) {
            $(document.body).append(mirror);
        }

        return this.each(function () {
            var
                ta = this,
                $ta = $(ta),
                maxHeight,
                minHeight,
                boxOffset = 0,
                callback = $.isFunction(options.callback),
                originalStyles = {
                    height: ta.style.height,
                    overflow: ta.style.overflow,
                    overflowY: ta.style.overflowY,
                    wordWrap: ta.style.wordWrap,
                    resize: ta.style.resize
                },
                timeout,
                width = $ta.width();

            if ($ta.data('autosize')) {
                // exit if autosize has already been applied, or if the textarea is the mirror element.
                return;
            }
            $ta.data('autosize', true);

            if ($ta.css('box-sizing') === 'border-box' || $ta.css('-moz-box-sizing') === 'border-box' || $ta.css('-webkit-box-sizing') === 'border-box') {
                boxOffset = $ta.outerHeight() - $ta.height();
            }

            // IE8 and lower return 'auto', which parses to NaN, if no min-height is set.
            minHeight = Math.max(parseInt($ta.css('minHeight'), 10) - boxOffset || 0, $ta.height());

            $ta.css({
                overflow: 'hidden',
                overflowY: 'hidden',
                wordWrap: 'break-word', // horizontal overflow is hidden, so break-word is necessary for handling words longer than the textarea width
                resize: ($ta.css('resize') === 'none' || $ta.css('resize') === 'vertical') ? 'none' : 'horizontal'
            });

            // The mirror width must exactly match the textarea width, so using getBoundingClientRect because it doesn't round the sub-pixel value.
            // window.getComputedStyle, getBoundingClientRect returning a width are unsupported, but also unneeded in IE8 and lower.
            function setWidth() {
                var width;
                var style = window.getComputedStyle ? window.getComputedStyle(ta, null) : false;

                if (style) {

                    width = ta.getBoundingClientRect().width;

                    if (width === 0) {
                        width = parseInt(style.width, 10);
                    }

                    $.each(['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'], function (i, val) {
                        width -= parseInt(style[val], 10);
                    });
                } else {
                    width = Math.max($ta.width(), 0);
                }

                mirror.style.width = width + 'px';
            }

            function initMirror() {
                var styles = {};

                mirrored = ta;
                mirror.className = options.className;
                maxHeight = parseInt($ta.css('maxHeight'), 10);

                // mirror is a duplicate textarea located off-screen that
                // is automatically updated to contain the same text as the
                // original textarea.  mirror always has a height of 0.
                // This gives a cross-browser supported way getting the actual
                // height of the text, through the scrollTop property.
                $.each(typographyStyles, function (i, val) {
                    styles[val] = $ta.css(val);
                });
                $(mirror).css(styles);

                setWidth();

                // Chrome-specific fix:
                // When the textarea y-overflow is hidden, Chrome doesn't reflow the text to account for the space
                // made available by removing the scrollbar. This workaround triggers the reflow for Chrome.
                if (window.chrome) {
                    var width = ta.style.width;
                    ta.style.width = '0px';
                    var ignore = ta.offsetWidth;
                    ta.style.width = width;
                }
            }

            // Using mainly bare JS in this function because it is going
            // to fire very often while typing, and needs to very efficient.
            function adjust() {
                var height, original;

                if (mirrored !== ta) {
                    initMirror();
                } else {
                    setWidth();
                }

                if (!ta.value && options.placeholder) {
                    // If the textarea is empty, copy the placeholder text into
                    // the mirror control and use that for sizing so that we
                    // don't end up with placeholder getting trimmed.
                    mirror.value = ($(ta).attr("placeholder") || '') + options.append;
                } else {
                    mirror.value = ta.value + options.append;
                }

                mirror.style.overflowY = ta.style.overflowY;
                original = parseInt(ta.style.height, 10);

                // Setting scrollTop to zero is needed in IE8 and lower for the next step to be accurately applied
                mirror.scrollTop = 0;

                mirror.scrollTop = 9e4;

                // Using scrollTop rather than scrollHeight because scrollHeight is non-standard and includes padding.
                height = mirror.scrollTop;

                if (maxHeight && height > maxHeight) {
                    ta.style.overflowY = 'scroll';
                    height = maxHeight;
                } else {
                    ta.style.overflowY = 'hidden';
                    if (height < minHeight) {
                        height = minHeight;
                    }
                }

                height += boxOffset;

                if (original !== height) {
                    ta.style.height = height + 'px';
                    if (callback) {
                        options.callback.call(ta, ta);
                    }
                }
            }

            function resize() {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    var newWidth = $ta.width();

                    if (newWidth !== width) {
                        width = newWidth;
                        adjust();
                    }
                }, parseInt(options.resizeDelay, 10));
            }

            if ('onpropertychange' in ta) {
                if ('oninput' in ta) {
                    // Detects IE9.  IE9 does not fire onpropertychange or oninput for deletions,
                    // so binding to onkeyup to catch most of those occasions.  There is no way that I
                    // know of to detect something like 'cut' in IE9.
                    $ta.on('input.autosize keyup.autosize', adjust);
                } else {
                    // IE7 / IE8
                    $ta.on('propertychange.autosize', function () {
                        if (event.propertyName === 'value') {
                            adjust();
                        }
                    });
                }
            } else {
                // Modern Browsers
                $ta.on('input.autosize', adjust);
            }

            // Set options.resizeDelay to false if using fixed-width textarea elements.
            // Uses a timeout and width check to reduce the amount of times adjust needs to be called after window resize.

            if (options.resizeDelay !== false) {
                $(window).on('resize.autosize', resize);
            }

            // Event for manual triggering if needed.
            // Should only be needed when the value of the textarea is changed through JavaScript rather than user input.
            $ta.on('autosize.resize', adjust);

            // Event for manual triggering that also forces the styles to update as well.
            // Should only be needed if one of typography styles of the textarea change, and the textarea is already the target of the adjust method.
            $ta.on('autosize.resizeIncludeStyle', function () {
                mirrored = null;
                adjust();
            });

            $ta.on('autosize.destroy', function () {
                mirrored = null;
                clearTimeout(timeout);
                $(window).off('resize', resize);
                $ta
                    .off('autosize')
                    .off('.autosize')
                    .css(originalStyles)
                    .removeData('autosize');
            });

            // Call adjust in case the textarea already contains text.
            adjust();
        });
    };
}(window.jQuery || window.$)); // jQuery or jQuery-like library, such as Zepto

/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2014 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Licensed under MIT
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @projectDescription Easy element scrolling using jQuery.
 * @author Ariel Flesler
 * @version 1.4.11
 */

(function (plugin) {
    // AMD Support
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], plugin);
    } else {
        plugin(jQuery);
    }
}(function ($) {

    var $scrollTo = $.scrollTo = function (target, duration, settings) {
        return $(window).scrollTo(target, duration, settings);
    };

    $scrollTo.defaults = {
        axis: 'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
        limit: true
    };

    // Returns the element that needs to be animated to scroll the window.
    // Kept for backwards compatibility (specially for localScroll & serialScroll)
    $scrollTo.window = function (scope) {
        return $(window)._scrollable();
    };

    // Hack, hack, hack :)
    // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
    $.fn._scrollable = function () {
        return this.map(function () {
            var elem = this,
                isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;

            if (!isWin)
                return elem;

            var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

            return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
                doc.body :
                doc.documentElement;
        });
    };

    $.fn.scrollTo = function (target, duration, settings) {
        if (typeof duration == 'object') {
            settings = duration;
            duration = 0;
        }
        if (typeof settings == 'function')
            settings = { onAfter: settings };

        if (target == 'max')
            target = 9e9;

        settings = $.extend({}, $scrollTo.defaults, settings);
        // Speed is still recognized for backwards compatibility
        duration = duration || settings.duration;
        // Make sure the settings are given right
        settings.queue = settings.queue && settings.axis.length > 1;

        if (settings.queue)
        // Let's keep the overall duration
            duration /= 2;
        settings.offset = both(settings.offset);
        settings.over = both(settings.over);

        return this._scrollable().each(function () {
            // Null target yields nothing, just like jQuery does
            if (target == null) return;

            var elem = this,
                $elem = $(elem),
                targ = target, toff, attr = {},
                win = $elem.is('html,body');

            switch (typeof targ) {
                // A number will pass the regex
                case 'number':
                case 'string':
                    if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                        targ = both(targ);
                        // We are done
                        break;
                    }
                    // Relative selector, no break!
                    targ = $(targ, this);
                    if (!targ.length) return;
                case 'object':
                    // DOMElement / jQuery
                    if (targ.is || targ.style)
                    // Get the real position of the target
                        toff = (targ = $(targ)).offset();
            }

            var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

            $.each(settings.axis.split(''), function (i, axis) {
                var Pos = axis == 'x' ? 'Left' : 'Top',
                    pos = Pos.toLowerCase(),
                    key = 'scroll' + Pos,
                    old = elem[key],
                    max = $scrollTo.max(elem, axis);

                if (toff) {// jQuery / DOMElement
                    attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

                    // If it's a dom element, reduce the margin
                    if (settings.margin) {
                        attr[key] -= parseInt(targ.css('margin' + Pos)) || 0;
                        attr[key] -= parseInt(targ.css('border' + Pos + 'Width')) || 0;
                    }

                    attr[key] += offset[pos] || 0;

                    if (settings.over[pos])
                    // Scroll to a fraction of its width/height
                        attr[key] += targ[axis == 'x' ? 'width' : 'height']() * settings.over[pos];
                } else {
                    var val = targ[pos];
                    // Handle percentage values
                    attr[key] = val.slice && val.slice(-1) == '%' ?
                        parseFloat(val) / 100 * max
                        : val;
                }

                // Number or 'number'
                if (settings.limit && /^\d+$/.test(attr[key]))
                // Check the limits
                    attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);

                // Queueing axes
                if (!i && settings.queue) {
                    // Don't waste time animating, if there's no need.
                    if (old != attr[key])
                    // Intermediate animation
                        animate(settings.onAfterFirst);
                    // Don't animate this axis again in the next iteration.
                    delete attr[key];
                }
            });

            animate(settings.onAfter);

            function animate(callback) {
                $elem.animate(attr, duration, settings.easing, callback && function () {
                    callback.call(this, targ, settings);
                });
            }

        }).end();
    };

    // Max scrolling position, works on quirks mode
    // It only fails (not too badly) on IE, quirks mode.
    $scrollTo.max = function (elem, axis) {
        var Dim = axis == 'x' ? 'Width' : 'Height',
            scroll = 'scroll' + Dim;

        if (!$(elem).is('html,body'))
            return elem[scroll] - $(elem)[Dim.toLowerCase()]();

        var size = 'client' + Dim,
            html = elem.ownerDocument.documentElement,
            body = elem.ownerDocument.body;

        return Math.max(html[scroll], body[scroll])
            - Math.min(html[size], body[size]);
    };

    function both(val) {
        return $.isFunction(val) || typeof val == 'object' ? val : { top: val, left: val };
    }

    // AMD requirement
    return $scrollTo;
}));

/*
 * jQuery Form Tips 1.2.6
 * By Manuel Boy (http://www.manuelboy.de)
 * Copyright (c) 2012 Manuel Boy
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 */

//(function (a) {
//    a.fn.formtips = function (b) {
//        var c = a.extend({tippedClass: "tipped"}, b);
//        return this.each(function () {
//            var b = a(this);
//            var d = a(b).attr("type");
//            if (d != "file" && d != "checkbox" && d != "radio") {
//                a(b).bind("focus", function () {
//                    var b = a(this).attr("title");
//                    if (a(this).val() == b) {
//                        a(this).val("").removeClass(c.tippedClass)
//                    }
//                    return true
//                });
//                a(b).bind("blur", function () {
//                    var b = a(this).attr("title");
//                    if (a(this).val() == "") {
//                        a(this).val(b).addClass(c.tippedClass)
//                    }
//                    return true
//                });
//                var e = a(b).attr("title");
//                if (a(b).val() == "" || a(b).val() == a(this).attr("title")) {
//                    a(b).val(e).addClass(c.tippedClass)
//                } else {
//                    a(b).removeClass(c.tippedClass)
//                }
//                a(b).parentsUntil("form").parent().submit(function () {
//                    var d = a(b).attr("title");
//                    if (a(b).val() == d) {
//                        a(b).val("").removeClass(c.tippedClass)
//                    }
//                })
//            }
//        })
//    }
//})(jQuery);

jQuery.extend(verge);
var desktop = true,
    tablet = false,
    mobile = false;

jQuery(function ($) {
    $(window).resize(function () {
        if ($.viewportW() >= 1024) {
            desktop = true;
            tablet = false;
            mobile = false;
        }
        if ($.viewportW() >= 768 && $.viewportW() <= 1023) {
            desktop = false;
            tablet = true;
            mobile = false;
        } else {
            if ($.viewportW() <= 767) {
                desktop = false;
                tablet = false;
                mobile = true;
            }
        }
    }).resize();
    if (!mobile) {
        $('.comments__message__text textarea').autosize();    
        $('.discount-pack').height('auto').height(($('.product').height() + 2) + 'px');
    }
    
    $(window).resize(function() {
        if (!mobile) {
            $('.comments__message__text textarea').autosize();
            $('.discount-pack').height('auto').height(($('.product').height() + 2) + 'px');
               
        }
        if (mobile) {
            $('.comments__message__text textarea').height('auto');
            $('.discount-pack').height('auto');
        }
    }).resize();
    //$('.categories-link').on('click', function(event) {
    //    event.preventDefault();
    //    $('.content__202').toggleClass('open');
    //    $('.mobile-nav').toggleClass('open');
    //});
    //$('.discount-link').on('click', function(event) {
    //    event.preventDefault();
    //    $('.coupon').toggleClass('open');
    //    $(this).toggleClass('open');
    //});
    //$('[title]').formtips();


    // qtip
    //if(!mobile){
	 //   $('.tip-box').each(function(index, el) {
	 //
	 //       $(this).children('a').qtip({
	 //           content: $(this).children('.tip-box__content'),
	 //           position: {
	 //               my: 'top center',  // Position my top left...
	 //               at: 'bottom center' // at the bottom right of...
	 //           },
	 //           style: { classes: 'qtip-blue' }
	 //
	 //       });
	 //   });
	//
	 //   $('.product-big__table__row .col1').each(function(index, el) {
	 //
	 //       $(this).qtip({
	 //           content: $(this).children('.tip-content'),
	 //           position: {
	 //               my: 'center right',  // Position my top left...
	 //               at: 'center left' // at the bottom right of...
	 //           },
	 //           show: 'click',
	 //           style: { classes: 'qtip-custom' , tip: {width: '10', height: '5'}}
	 //
	 //       });
	 //   });
	//}
		
	//
	//$('.descr').click(function (e) {
	//	$('.tip-content').hide();
	//	$(this).siblings('.tip-content').show();
	//});

	//$(document).click(function(e){
	//	if ($(e.target).closest('.tip-content').length==0 && (!$(e.target).hasClass('descr'))){
	//		$('.tip-content').hide();
	//	}
	//});
	
	
        

    //$(window).load(function () {
    //    $('.discount-banner').height($('.product-list .product').height() * 2 + 14 + 'px');
    //});

    if ($('.product-big').length) {
        //$('.product-big__tabs__controls ul li a').on('click', function (e) {
        //    e.preventDefault();
        //    $('.product-big__tabs__controls ul li a').removeClass('active');
        //    var el = $(this).addClass('active').parent();
        //    el.closest('.product-big__tabs').find('.product-big__tabs__layers .item').css('display', 'none').eq(el.index()).show();
        //});

        //$('.product__main__img .img a, .product__btn a').on('click', function (e) {
        //    e.preventDefault();
        //    var el = $(this);
			//var box = $(el.attr('href'));
        //    $('.product_i').removeClass('open');
        //    el.closest('.product_i').addClass('open');
        //
        //    $('.product-list__row').css('padding-bottom', '0');
        //    $('.packs-list__item-descr').removeClass('active');
        //    $('.icon_cart-corner').removeClass('open');
			//$.scrollTo(box, 800, {offset: {top: -10}});
        //    if (!mobile) {
        //        el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
        //    };
        //});

        //$('.product__main__img .more').on('click', function (e) {
        //    e.preventDefault();
        //    var el = $(this);
        //    var box = $(el.attr('href'));
        //    box.find('.more-info').click();
			//
        //    $('.product_i').removeClass('open');
        //    el.closest('.product_i').addClass('open');
        //
        //    $('.product-list__row').css('padding-bottom', '0');
        //    $('.packs-list__item-descr').removeClass('active');
        //    $('.icon_cart-corner').removeClass('open');
			//$.scrollTo(box, 800, {offset: {top: -10}});
        //    if (!mobile) {
        //        el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
        //    }
		//
        //});
        $(window).resize(function() {
            if (mobile) {
                if ($('.product-big').length) {
                    $('.product-list__row').css('padding-bottom', '0');
                }
            }
        });
//        $('.product-big .more-info').on('click', function (e) {
//            e.preventDefault();
//            var el = $(this);
//            if (!el.parent('.product-big').find('.product-big__tabs').hasClass('open')) {
//                el.closest('.product-big').find('.product-big__tabs').addClass('open');
//                $('.product-list__row').css('padding-bottom', '0');
//                el.closest('.product-big').find('.product-big__tabs__controls ul li a').eq(0).addClass('active');
//                el.closest('.product-big').find('.product-big__tabs__layers .item').eq(0).fadeIn();
//                el.closest('.product-big').find('.product-big__hide').addClass('open');
//                if (!mobile) {
//                    el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
//                }
//            }
//            else{
//                $('.product-big__tabs').removeClass('open');
//                $('.product-list__row').css('padding-bottom', '0');
//                $('.product-big__hide').removeClass('open');
//                if (!mobile) {
//                    el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
//                }
//            }
//        });
//
//        $('.product-big__hide a').on('click', function (e) {
//            e.preventDefault();
//            var el = $(this);
//
//            el.closest('.product-big').find('.more-info').removeClass('open');
//            el.closest('.product-big__hide').removeClass('open');
//            $('.product-big__tabs').removeClass('open');
//            $('.product-list__row').css('padding-bottom', '0');
//
//            if (!mobile) {
//                el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
//            }
//        });
//
//        $('.product-big .close').on('click', function (e) {
//            e.preventDefault();
//            $('.product_i').removeClass('open');
//            $('.product-big__tabs').removeClass('open');
//            $('.product-list__row').css('padding-bottom', '0');
//            $('.product-big__hide').removeClass('open');
////            if (!mobile) {
////                el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
////            }
//
//        });
    }

    //$('.tab-box__controls a').on('click',function (e) {
    //    e.preventDefault();
    //    var el = $(this),
    //        layers = $('.tab-box__layers .item');
    //    $('.tab-box__controls a').removeClass('active');
    //    el.addClass('active');
    //    layers.not(layers.eq(el.parent().index())).css('display', 'none');
    //    layers.eq(el.parent().index()).fadeIn();
    //}).eq(0).click();
	//
    //
	//
    //$('.prod-data .title__btn').on('click', function (e) {
    //    e.preventDefault();
    //    $('.prod-data').toggleClass('open');
    //    $('.prod-data_i').slideToggle();
    //});
	//
    //$('.count-table .controls a').on('click',function (e) {
    //    e.preventDefault();
    //    var el = $(this);
    //    $('.count-table .controls a').removeClass('active');
    //    el.addClass('active');
    //    $('.count-table .layers .item').css('display', 'none');
    //    $(el.attr('href')).fadeIn();
    //}).eq(0).click();
	//
    //$('.comments__show').on('click', function (e) {
    //    e.preventDefault();
    //    $(this).toggleClass('closed');
    //    $('.comments__list').slideToggle();
    //});

    //$('.shipping-type a').not('.shipping-type a.inactive').on('click', function (e) {
    //    e.preventDefault();
    //    var el = $(this);
    //    el.addClass('active');
    //    $('.shipping-type a').not(el).removeClass('active');
    //});
	//
    //$('.bonus-choose a').on('click', function (e) {
    //    e.preventDefault();
    //    var el = $(this);
    //    el.addClass('active');
    //    $('.bonus-choose a').not(el).removeClass('active');
    //});
	
	//function customCheckbox(){
	//	$(this).prop("checked", $(this).prop("checked"));
	//	if ($(this).prop("checked")){
	//		$(this).siblings().children('.checkbox').addClass('active');
	//		}
	//	else{  $(this).siblings().children('.checkbox').removeClass('active'); }
	//
	//};
	
	//$('#payinf').on('click', customCheckbox);
	//$('#insurance').on('click', customCheckbox);
	
	//$('select').on('change', function(e){
	//	$(this).siblings('.value').html($("option:selected", this).text());
	//});
	

    //$('.type__title').on('click', function(e){
    //    e.preventDefault();
    //    $('.type__drop').fadeToggle();
    //});

    //$('.currency .title').on('click', function(e){
    //    e.preventDefault();
    //    $(this).closest('.currency').find('.drop').fadeToggle();
    //});
    //$('.nav-link').on('click', function(event) {
    //    event.preventDefault();
    //    $('body').toggleClass('open-nav');
    //});

    if(mobile){
        if($('.count-table .controls table tbody tr td').length===1){
            $('.count-table .controls table tbody tr td').css('width','100%');
        }
    }

});