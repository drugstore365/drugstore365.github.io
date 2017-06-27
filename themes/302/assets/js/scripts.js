//var coupon = {
//	$: {
//		root: '.coupon-box',
//		activated: '.coupon-activated',
//		notActivated: '.coupon-not-activated',
//		text: '.coupon__active > p:first',
//		form: '.coupon-form',
//		field: 'input[name=coupon]'
//	},
//	init: function() {
//		$(coupon.$.root).each(function () {
//			var root = $(this);
//			root.find(coupon.$.form).each(function () {
//				var form = $(this);
//				form.on('submit', $.proxy(coupon.submit, form, root));
//			});
//			root.find('.coupon__error a').on('click', function (e) {
//				e.preventDefault();
//				root.find('.coupon__error').hide();
//				root.find('.coupon__enter').show();
//			});
//		});
//	},
//	submit: function(root) {
//		var form = this;
//		if (form.hasClass('submitting')) {
//			return false;
//		}
//		// todo: dirty fix for formtips
//		var field = form.addClass('submitting').find(coupon.$.field).trigger('focus');
//		var value = $.trim(field.val());
//		field.trigger('blur');
//		var complete = function () {
//			form.removeClass('submitting');
//		};
//		if (value.length > 0) {
//			$.ajax({
//				url: routes.coupon,
//				data: {
//					coupon: value
//				},
//				success: function (data) {
//					data = $('<div/>').append(jQuery.parseHTML(data));
//					if (data.find('.coupon-ok').length) {
//						root.find(coupon.$.notActivated).remove();
//						root.find(coupon.$.activated).find(coupon.$.text).html(data.find('.hidden').html()).end().show();
//						if (selectedPage == 'cart') {
//							setTimeout(function () {
//								document.location.reload();
//							}, 1500);
//						}
//					} else {
//						root.find('.coupon__enter').hide();
//						root.find('.coupon__error').show();
//					}
//				},
//				complete: complete
//			});
//		} else {
//			complete();
//		}
//		return false;
//	}
//};

//function customCheckbox() {
//	$("input[type='checkbox']").Custom({
//		customStyleClass:'checkbox',
//		customHeight:'18'
//	});
//
//	$('.qty select').selectmenu();
//}
//
//function saveReview() {
//	var param = {};
//	$("#form_review").find("input,textarea").each( function() {
//		var el_type = $(this).attr('type');
//		param[$(this).attr('name')] = $(this).val();
//	});
//
//	$.post('/review/save/', param, function (responseText, textStatus) {
//		$('#reviews').html(responseText);
//	});
//}

String.prototype.lpad = function(padString, length) {
	var str = this;
	while (str.length < length)
		str = padString + str;
	return str;
};

/* Quick search customization */
var orderButtonTemplate = '<a class="btn-orange btn_small" href="#">Order now</a>';
var shippingMethodTooltipConfig = {
	map: {
		airmail: 'tooltip_shiping_airmail',
		ems:     'tooltip_shiping_trackable',
		usps:    'tooltip_shiping_usps'
	},
	position: 'aboveStatic'
};

$(document).ready(function(){
	/* product page tabs*/
	//if (typeof window.initSelect == 'function'){
	//	window.initSelect();
	//}

	$(document).keyup(function(e) {
		//if (e.keyCode == 27) { // ESC
		//	coupon.close();
		//	$('.bonus-popup').hide();
		//}
		//if (e.keyCode == 13) { // Enter
		//	if ( $(document.activeElement).attr('id') == 'coupon_inp' ) {
		//		$(coupon.$.submit).click();
		//	}
		//}
	});

	//$('.btn-bonus').click(function(event) {
	//	event.preventDefault();
	//	$('.bonus-popup').not($(this).parent().find('.bonus-popup')).hide();
	//	$(this).parent().find('.bonus-popup').toggle();
	//	$('div.body').toggleClass('bns-open');
	//});

	$('.paym').click(function() {
		return checkout();
	});

	//// prevent browser from scrolling to top of page
	//$(".submit-link").click(function(event){
	//	event.preventDefault();
	//});

	//$('#form_cart')
	//	.on('click', '.cart-shipping', function (e) {
	//		e.preventDefault();
	//		var el = $(this);
	//		el.closest('.shipping').find('input[name="shipping_method_id"]').val(el.data('id')).trigger('change');
	//	})
	//	.on('click', '.cart-bonus', function (e) {
	//		e.preventDefault();
	//		var el = $(this);
	//		el.closest('.bonus-choose').find('input[name="bonus_product_id"]').val(el.data('id')).trigger('change');
	//	});

	// dosage tabs
	//(function(){
	//	var enableTab = function() {
	//		$($(this).parents('.tabs').get(0)._active).removeClass('spr_prod_tab_bg act');
	//		$($(this).parents('.tabs').get(0)._active._prev).removeClass('b-act');
	//		$($(this).parents('.tabs').get(0)._active._info).hide();
	//		$(this).addClass('spr_prod_tab_bg act');
	//		$(this._prev).addClass('b-act');
	//		$(this._info).show();
	//		$(this).parents('.tabs').get(0)._active = this;
	//	};
	//
	//	var prev_tab = null;
	//
	//	$('.dose_container div.tab').each(function(i, tab) {
	//		if ($(tab).hasClass('act')) {
	//			$(tab).parents('.tabs').get(0)._active = tab;
	//			prev_tab = null;
	//		}
	//		tab._info = $('.dose.'+ tab.id, $(tab).parents('.dose_container')).get(0);
	//		tab._prev = prev_tab;
	//		prev_tab = tab;
	//		$(tab).click(enableTab);
	//	});
	//})();

	//$('span.airmail, span.trackable, span.usps, span.ems').click(function() {
	//	if ($(this).attr('class').indexOf('usps') != -1) {
	//		$('#r_us_delivery').parent().click();
	//		$('#r_us_delivery').click();
	//	} else {
	//		$('#r_worldwide_delivery').parent().click();
	//		$('#r_worldwide_delivery').click();
	//	}
	//});

	//$('input[name=delivery]').length && updateDelivery();

	//if (typeof scd == 'object') {
	//	if ($.inArray('hide_secured_seals', scd['f']) >= 0)
	//		$('.awards>a').hide();
	//
	//	if ($.inArray('hide_banner', scd['f']) >= 0)
	//		$('.footer-banner').hide();
	//
	//	for (cat in scd['c'])
	//		// TODO: category friendly url?
	//		$("a.b-acc[href='/?category=" + scd['c'][cat] + "']").hide();
	//}

	if (window.name === 'couponActivate') {
		$('.coupon').css('border','medium solid #FDFF47');
		window.name = 'window';
	}

	//// dicount timer box
	//if ( $('.timer').length ) {
	//	var $timerBox     = $('.timer_i, .timer-helper'),
	//	   $timer = $('.timer'),
	//		$timerBig     = $('.timer__big'),
	//		$timerClose   = $('.timer-hide'),
	//		$timerSmall   = $('.timer__small');
	//
	//	$timerSmall.click(function(){
	//		$timerClose.show();
	//		$(this).fadeOut();
	//		$timerBox.animate({'height':100}, 500, function(){
	//			$timerBig.fadeIn();
	//		});
	//		setCookie('timer', 'show', null, '/');
	//	});
	//	$timerClose.click(function(e){
	//		e.preventDefault();
	//		$(this).fadeOut();
	//		$timerBig.fadeOut(function(){
	//			$timerBox.animate({'height':30}, 500, function(){
	//				$timerSmall.fadeIn();
	//			});
	//		});
	//		setCookie('timer', 'hide', null, '/');
	//	});
	//	if ($timerSmall.is(":visible")) {
	//		$timerBox.height(30);
	//	}
	//	if ( $.browser.msie && $.browser.version == '6.0' ) {
	//		$(window).scroll(function(){
	//			setTimeout(function(){
	//				$timer.css('top', $(window).scrollTop());
	//			}, 20);
	//		}).scroll();
	//	}
	//	var timerInterval = setInterval(function() {
	//		var hours   = $("#timer_hours").html();
	//		var minuts  = $("#timer_minuts").html();
	//		var seconds = $("#timer_seconds").html();
	//
	//		if (--seconds < 0) {
	//			seconds = 59;
	//			if (--minuts < 0) {
	//				minuts = 59;
	//				hours--;
	//			}
	//		}
	//
	//		if (seconds == 0 && minuts == 0 && hours == 0) {
	//			clearInterval(timerInterval);
	//			$(".timer").remove();
	//		}
	//		else {
	//			$("#timer_hours").html(hours.toString());
	//			$("#timer_minuts").html(minuts.toString());
	//			$("#timer_seconds").html(seconds.toString());
	//			$("#timer_time").html(hours.toString().lpad('0', 2) + ':'
	//				+ minuts.toString().lpad('0', 2) + ':'
	//				+ seconds.toString().lpad('0', 2));
	//		}
	//	}, 1000);
	//}

	//$('.pack-pill .hover').click(function (e) {
	//	e.preventDefault();
	//	var el = $(this);
	//
	//	if (!el.hasClass('active')) {
	//	   $('.pack-pill__tip').hide();
	//	   $('.pack-pill .hover').removeClass('active');
	//		el.parent().find('.pack-pill__tip').show();
	//	} else {
	//		el.parent().find('.pack-pill__tip').hide();
	//	}
	//	el.toggleClass('active');
	//});

    //$('.hide-and-order').on('click', function (e) {
    //    e.preventDefault();
    //    var box = $(this).closest('.product-big');
    //    box.find('.product-big__tabs').removeClass('open');
    //    box.find('.product-big__hide').removeClass('open');
    //    if (!mobile) {
    //        box.closest('.product-list__row').css('padding-bottom', box.closest('.product_i').find('.product-big').outerHeight());
    //    }
    //});

	//$(document).click(function(e){
	//	 var el = $(e.target);
	//	 if (el.parent().hasClass('pack-pill')) {
	//		return;
	//	 }
	//	 if (!el.parents('.pack-pill__tip').length) {
	//		$('.pack-pill__tip').hide();
	//		$('.pack-pill .hover').removeClass('active');
	//	 }
	//});

     // /*menu scrollTo*/
	//$('.menu .pack, .pack, .star-packs__item a, .star-packs__item .star-packs__price').click(function(e){
	//var el = $(this).attr('href') ? $(this).attr('href') : $(this).closest('tr').find('a').attr('href');
	//	if (el !== '' && el[0] == '/') {
	//	  return;
	//	}
	//	e.preventDefault();
	//	$(window).scrollTo(el, 800,{offset:{left:0,top:-10}});
	//	$(el).find('.product__btn a').click();
	//});
	//
	DeliveryTooltip();

	// Wrap elements on packs page
	if (selectedPage == 'packs') {
		//var divs = $("div.star-packs__item");
		//var count = divs.length;
		//var colcount = Math.ceil(count / 3);
		//for(var i = 0; i < divs.length; i += colcount) {
		//	var td = (i >= colcount) ? "<td/>" : "<td class='first'/>";
		//	divs.slice(i, i + colcount).wrapAll(td);
		//}
		//$(".star-packs td").wrapAll("<tr/>");
		//$(".star-packs tr").wrapAll("<table/>");
		//
		//divs = $("div.packs-list__item");
		//for(var i = 0; i < divs.length; i += 3) {
		//	$(divs[i]).addClass("packs-list__item_first");
		//	divs.slice(i, i + 3).wrapAll("<div class='packs-list__row clearfix'/>");
		//}
		//
		//divs = $("div.paks-list__item-descr");
		//for(var i = 0; i < divs.length; i += 3) {
		//	divs.slice(i, i + 3).wrapAll("<div class='packs-descr clearfix'/>");
		//}
		//
		//divs = $("div.packs-descr");
		//var packitems = $("div.packs-list__row");
		//for(var i = 0; i < packitems.length; i ++) {
		//	packitems[i].appendChild(divs[i]);
		//}
	}
});

//function DeliveryTooltip() {
//	$('.product__delivery div').hover(function () {
//		var offset = $(this).offset(),
//			center = $(this).width() / 2;
//			leftPos = 82.5 - center;
//
//		$('#tooltip_shiping_airmail').offset( {left:offset.left - leftPos, top:offset.top - 70} ).css('display', 'block');
//	}, function () {
//		$('#tooltip_shiping_airmail').removeAttr('style');
//	});
//}

function IErefererHack(url) {
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
		var referLink = document.createElement('a');
		referLink.href = url;
		referLink.target = '_blank';
		document.body.appendChild(referLink);
		referLink.click();
		return false;
	}
	return true;
}

//function popup(url, title, width, height) {
//	var screen_width = window.screen.width;
//	var screen_height = window.screen.height;
//	height = height + 30;
//
//	var top;
//	if (screen_height > height && screen_height != height)
//		top = Math.round((screen_height - height) / 2);
//	else
//		top = 0;
//
//	var left;
//	if (screen_width > width && screen_width != width)
//		left = Math.round((screen_width - width) / 2);
//	else
//		left = 0;
//
//	var popup_options = 'menubar=0, location=0, scrollbars=1, status=0, resizable=1, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left;
//	// bugfix: the open command doesn't understand the title parameter
//	window.open(url, null, popup_options);
//}

//function updateCartHeader(responseText) {
//	$('#header_cart_total').html($(responseText).find('tr.bott .col3').html());
//	$('#header_cart_items').html($(responseText).find('#cart-items').val());
//}