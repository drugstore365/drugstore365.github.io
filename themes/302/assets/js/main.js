var coupon = {
	$: {
		root: '.coupon-box',
		activated: '.coupon-activated',
		notActivated: '.coupon-not-activated',
		text: '.coupon__active > p:first',
		form: '.coupon-form',
		field: 'input[name=coupon]'
	},
	init: function() {
		$(coupon.$.root).each(function () {
			var root = $(this);
			root.find(coupon.$.form).each(function () {
				var form = $(this);
				form.on('submit', $.proxy(coupon.submit, form, root));
			});
			root.find('.coupon__error a').on('click', function (e) {
				e.preventDefault();
				root.find('.coupon__error').hide();
				root.find('.coupon__enter').show();
			});
		});
	},
	submit: function(root) {
		var form = this;
		if (form.hasClass('submitting')) {
			return false;
		}
		// todo: dirty fix for formtips
		var field = form.addClass('submitting').find(coupon.$.field).trigger('focus');
		var value = $.trim(field.val());
		field.trigger('blur');
		var complete = function () {
			form.removeClass('submitting');
		};
		if (value.length > 0) {
			$.ajax({
				url: routes.coupon,
				data: {
					coupon: value
				},
				success: function (data) {
					data = $('<div/>').append(jQuery.parseHTML(data));
					if (data.find('.coupon-ok').length) {
						root.find(coupon.$.notActivated).remove();
						root.find(coupon.$.activated).find(coupon.$.text).html(data.find('.hidden').html()).end().show();
						if (selectedPage == 'cart') {
							setTimeout(function () {
								document.location.reload();
							}, 1500);
						}
					} else {
						root.find('.coupon__enter').hide();
						root.find('.coupon__error').show();
					}
				},
				complete: complete
			});
		} else {
			complete();
		}
		return false;
	}
};

function popup(url, title, width, height) {
	var screen_width = window.screen.width;
	var screen_height = window.screen.height;
	height = height + 30;

	var top;
	if (screen_height > height && screen_height != height)
		top = Math.round((screen_height - height) / 2);
	else
		top = 0;

	var left;
	if (screen_width > width && screen_width != width)
		left = Math.round((screen_width - width) / 2);
	else
		left = 0;

	var popup_options = 'menubar=0, location=0, scrollbars=1, status=0, resizable=1, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left;
	window.open(url, null, popup_options);
}

function deliveryTooltip() {

	$('.product__delivery div').hover(function () {
		var elem = this,
			offset = $(this).offset(),
			center = $(this).width() / 2,
			leftPos = 82.5 - center,
			airmailTooltip = $('#tooltip_shiping_airmail'),
			emsTooltip = $('#tooltip_shiping_trackable');

		if($(elem).hasClass('icon-AirMail')){
			airmailTooltip.offset( {left:offset.left - leftPos, top:offset.top - 70} ).stop(true, true).show();
		}
		else if($(elem).hasClass('icon-EMS')) {
			emsTooltip.offset( {left:offset.left - leftPos, top:offset.top - 70} ).stop(true, true).show();
		}
	}, function(){
		var airmailTooltip = $('#tooltip_shiping_airmail'),
			emsTooltip = $('#tooltip_shiping_trackable');

		airmailTooltip.removeAttr('style');
		emsTooltip.removeAttr('style');
	});
}

function updateCartHeader(responseText) {
	$('#header_cart_total').html($(responseText).find('tr.bott .col3').html());
	$('#header_cart_items').html($(responseText).find('#cart-items').val());
}

$(document).ready(function() {
	coupon.init();

    var ua          = navigator.userAgent.toLowerCase(),
        android2    = ua.indexOf("android 2") > -1,
        android3    = ua.indexOf("android 3") > -1;

    if (android2 || android3) {
        $('body').addClass('android_lt');
    }

	$(document).keyup(function(e) {
		if (e.keyCode == 13) { // Enter
			if ($(document.activeElement).attr('id') == 'coupon_inp') {
				$(coupon.$.submit).click();
			}
		}
	});

    $('body').click(function(e) {
        if (!$(e.target).closest('.currency').length) {
            $(".currency").find('.drop').hide();
        }
    });

	$('.currency .title').on('click', function(e){
		e.preventDefault();

		var dropBlock = $(this).siblings('.drop');

		if(dropBlock.is(":visible")) {
            dropBlock.hide();
        } else {
            $('.drop').hide();
            dropBlock.show();
        }
    });

	$('[title]').formtips();

	$('.categories-link').on('click', function(event) {
		event.preventDefault();
		$('.content__202').toggleClass('open');
		$('.mobile-nav').toggleClass('open');
	});
	$('.discount-link').on('click', function(event) {
		event.preventDefault();
		$('.coupon').toggleClass('open');
		$(this).toggleClass('open');
	});
	$('.nav-link').on('click', function(event) {
		event.preventDefault();
		$('body').toggleClass('open-nav');
	});

	deliveryTooltip();

	$('.forms .check-box label').click(function () {
		$('.forms .check-box').toggleClass('checked');
	});

	$('.radio-item label').click(function () {
		var radioItem = $(this).parent('.radio-item');
		if($(this).closest('.radio-item').hasClass('active')){
			return;
		}else{
			$(this).closest('.radio-item').siblings('.radio-item').removeClass('active');
			$(this).closest('.radio-item').addClass('active');
		}
	});

	if (typeof window.initSelect == 'function'){
		window.initSelect();
	}

	// dicount timer box
	if ( $('.timer').length ) {
		var $timerBox     = $('.timer_i, .timer-helper'),
			$timer = $('.timer'),
			$timerBig     = $('.timer__big'),
			$timerClose   = $('.timer-hide'),
			$timerSmall   = $('.timer__small');

		$timerSmall.click(function(){
			$timerClose.show();
			$(this).fadeOut();
			$timerBox.animate({'height':100}, 500, function(){
				$timerBig.fadeIn();
			});
			setCookie('timer', 'show', null, '/');
		});
		$timerClose.click(function(e){
			e.preventDefault();
			$(this).fadeOut();
			$timerBig.fadeOut(function(){
				$timerBox.animate({'height':30}, 500, function(){
					$timerSmall.fadeIn();
				});
			});
			setCookie('timer', 'hide', null, '/');
		});
		if ($timerSmall.is(":visible")) {
			$timerBox.height(30);
		}
		if ( $.browser.msie && $.browser.version == '6.0' ) {
			$(window).scroll(function(){
				setTimeout(function(){
					$timer.css('top', $(window).scrollTop());
				}, 20);
			}).scroll();
		}
		var timerInterval = setInterval(function() {
			var hours   = $("#timer_hours").html();
			var minuts  = $("#timer_minuts").html();
			var seconds = $("#timer_seconds").html();

			if (--seconds < 0) {
				seconds = 59;
				if (--minuts < 0) {
					minuts = 59;
					hours--;
				}
			}

			if (seconds == 0 && minuts == 0 && hours == 0) {
				clearInterval(timerInterval);
				$(".timer").remove();
			}
			else {
				$("#timer_hours").html(hours.toString());
				$("#timer_minuts").html(minuts.toString());
				$("#timer_seconds").html(seconds.toString());
				$("#timer_time").html(hours.toString().lpad('0', 2) + ':'
				+ minuts.toString().lpad('0', 2) + ':'
				+ seconds.toString().lpad('0', 2));
			}
		}, 1000);
	}
});