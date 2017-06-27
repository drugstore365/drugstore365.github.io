var submitProcessed = 0;
var scd;

function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function submitForm(b) {
	var s = true;
	var f = $(b).closest('form');
	var fe = $(f).find('input,textarea');
	fe.each(function(i){
		var v = $(this).val();
		if($(this).attr('title') == v || v.replace(/\s+/g, "")  == ''){
			s = false;
			return false;
		}
	});
	if(s) return f.submit();
	return false;
}

function confirmOrder(button) {
	$(button).attr('disabled',true).hide();
	$('#fake_button').show();
	$('#fake_form').submit();
	return false;
}

function isIE( version, comparison ){
	var $div = $('<div style="display:none;"/>').appendTo($('body'));
	$div.html('<!--[if '+(comparison||'')+' IE '+(version||'')+']><a>&nbsp;</a><![endif]-->');
	var ieTest = $div.find('a').length;
	$div.remove();
	return ieTest;
}

// function refreshSelect(select){
// 	if(!window.isIE(7, 'lte')){
// 		if(select !== undefined){
// 			$(select).selectmenu('refresh');
// 		} else {
// 			$('select').selectmenu('refresh');
// 		}
// 	}
// }
//
// function initSelect(select){
// 	if(!window.isIE(7, 'lte')){
// 		if(select !== undefined){
// 			$(select).selectmenu();
// 		} else {
// 			if($('select').length){
// 				$('select').selectmenu();
// 			}
// 		}
// 	}
// }

function submitProcessStart() {
	if (submitProcessed++) return false;
	$("body").addClass('submit-processed');
	return true;
}

function submitProcessStop() {
	submitProcessed = 0;
	$("body").removeClass('submit-processed');
}

function goToURL(url){window.location=url;}

$.fn.randomize = function (){
	var i = this.length;
	if ( i == 0 ) return;
	return $(this[ Math.floor(Math.random() * i) ]);
};

$.fn.shuffle = function (){
	var i = this.length, j, temp;
	if ( i == 0 ) return $(this);
	while ( --i ) {
		j = Math.floor(Math.random() * i);
		temp = this[i];
		this[i] = this[j];
		this[j] = temp;
	}
	return $(this);
};

function getQueryParams(qs) {
	var params = {};
	var pattern = /[?&]?([^=]+)=([^&]*)/g;
	if (typeof qs != 'string') qs = window.location.search;
	qs = qs.split("+").join(" ");
	var tokens;
	while (tokens = pattern.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}

function updateLangAndCurr(param) {
	var url = window.location.pathname || '';
	url += '?' + $.param($.extend({}, getQueryParams(), param));
	url += window.location.hash || '';
	goToURL(url);
}

function updateCart(el) {
	if (!submitProcessStart()) return;

	var param = {};

	$("#form_cart").find("input[name!=i],select:visible,textarea:visible").each( function() {
		var el_type = $(this).attr('type');
		if (el_type == 'radio' && !this.checked) return;
		if (el_type == 'checkbox') {
			param[$(this).attr('name')] = this.checked ? 1 : 0;
		} else {
			param[$(this).attr('name')] = $(this).val();
		}
	});

	if ($(el).val() == 0 && $(el).attr('name') != 'bonus_product_id') {
		var title = $(el).data('title').replace(/\s\s+/g, '');
		var msg = msgs.removeProduct.replace(/%PRODUCT_TITLE%/g, title.replace(/<\/?[^>]+>/gi, ''));
		var result = confirm(msg);
		if (!result) {
			setTimeout(function() {
				$(el).find('option').prop('selected', function() {
					return this.defaultSelected;
				});
			}, 200);

			submitProcessStop();
			return false;
		}
	}

	$.post(routes.cart_update, param, function (responseText, textStatus) {
		if (responseText.indexOf('STATUS_OK') == -1) {
			window.location.reload(true);
		}
		else {
			$('#form_cart').html(responseText);
			$('body').trigger('updateCart');
			if (typeof customCheckbox == 'function') {
				customCheckbox();
			}
			if (typeof updateCartHeader == 'function') {
				updateCartHeader(responseText);
			}
		}
		submitProcessStop();
		if(typeof selectInit == 'function') {
			selectInit();
		}
		if(typeof updateCheckbox == 'function') {
			updateCheckbox();
		}
	});
}

var upgradedProduct = {};
function setUpgradedProduct(data) {
	return upgradedProduct = data;
}
function displayUndoButton(responseText) {
	for (var productIndex in upgradedProduct) {
		if ($(responseText).find('undo[data-index='+productIndex+']')) {
			$('.undo[data-index='+productIndex+']').show();
		}
	}
}

function upgradeProduct(oldID, newID, productIndex) {
	if (!submitProcessStart()) return;

	var param = {
		old_id: oldID,
		new_id: newID
	};

	$.get(routes.cart_upgrade, param, function (responseText) {
		if (responseText.indexOf('STATUS_OK') == -1) {
			window.location.reload(true);
		}
		else {
			$('#form_cart').html(responseText);
			if (typeof customCheckbox == 'function') {
				customCheckbox();
			}
			if (typeof updateCartHeader == 'function') {
				updateCartHeader(responseText);
			}

			var data = upgradedProduct || {};
			var undoButton = $('.undo[data-index='+productIndex+']');
			if (!data[productIndex]) {
				data[productIndex] = oldID;
				setUpgradedProduct(data);
			}
			if (typeof displayUndoButton == 'function') {
				displayUndoButton(responseText);
			}
			if (upgradedProduct[productIndex] == newID) {
				undoButton.hide();
				delete upgradedProduct[productIndex];
			}
		}
		submitProcessStop();

		if(typeof selectInit == 'function') {
			selectInit();
		}
	});
}

function upgradeProductHeader(oldID, newID) {

	if (!submitProcessStart()) return;

	var param = {
		old_id: oldID,
		new_id: newID
	};


	$.get(routes.upgrade_product_header, param, function (responseText, textStatus) {
		if (responseText.indexOf('STATUS_OK') == -1) {
			window.location.reload(true);
		} else {
			$('#upgrade_roduct_header').html(responseText);
			if (typeof customCheckbox == 'function') {
				customCheckbox();
			}
		}
		submitProcessStop();
	});
	return false;
}

function removeProduct(productID, productTitle) {
	productTitle = productTitle.replace(/\s+/g, ' ');
	var msg = msgs.removeProduct.replace(/%PRODUCT_TITLE%/g, productTitle).replace(/<\/?[^>]+>/gi, '');
	var result = confirm(msg);
	if (result) {
		var param = {
			product_id: productID
		};

		$.get(routes.cart_remove, param, function (responseText, textStatus) {
			if (responseText.indexOf('STATUS_OK') == -1) {
				window.location.reload(true);
			}
			else {
				$('#form_cart').html(responseText);
				if (typeof customCheckbox == 'function') {
					customCheckbox();
				}
				if (typeof updateCartHeader == 'function') {
					updateCartHeader(responseText);
				}
			}
			if (typeof selectInit == 'function') {
				selectInit();
			}
		});
	}
}

function checkout() {
	var form_checkout = $("#form_checkout");
	form_checkout.empty();
	$('<input type="hidden"/>').attr({name: 'i', value: $("#i").val()}).appendTo(form_checkout);
	form_checkout.submit();
}

function validateSearchedValue(string) {
	// remove special symbols
	string = string.replace(/[&\|\+!\(\)@\[\]\*"~\/<=\^\$]/g, '');

	// suppress spaces
	string = string.replace(/\s+/g, ' ');

	// remove trailng spaces
	string = $.trim(string);

	if (string == '' || string == msgs.search) {
		alert(msgs.emptySearchQuery);
		return false;
	} else if (string.length < 3) {
		alert(msgs.minLengthIs + ' 3 ' + msgs.characters);
		return false;
	} else if (string.length > 20) {
		alert(msgs.maxLengthIs + ' 20 ' + msgs.characters);
		return false;
	}

	return true;
}

function translate(string, search, replace) {
	for (var i = 0; i < search.length; i++) {
		var regex = new RegExp(search.charAt(i), "g");
		string = string.replace(regex, replace.charAt(i));
	}
	return string;
}

function updateReviews(param) {
	if (!submitProcessStart()) return;
	param.product = $("#product").val();

	$.post('/product/reviews/', param, function (responseText, textStatus) {
		if (responseText.indexOf('STATUS_OK') == -1) {
			//window.location.reload(true);
		}
		else {
			$('#product_reviews').html(responseText);
		}
		submitProcessStop();
	});
}

function sendReview(callback) {
	if (!submitProcessStart()) return;
	if ($("#write_review_form").get(0).clearPlaceholders) $("#write_review_form").get(0).clearPlaceholders();

	var param = {
		product: $("#product").val()
	};
	$("#write_review_form").find("input,select,textarea").each( function() {
		var el_type = $(this).attr('type');
		if ((el_type == 'radio' || el_type == 'checkbox') && !$(this).attr('checked')) return;
		param[$(this).attr('name')] = $(this).val();
	});

	$.post('/product/review/send/', param, function (responseText, textStatus) {
		submitProcessStop();
		if (responseText.indexOf('STATUS_OK') == -1) {
			window.location.reload(true);
		}
		else {
			if (typeof(callback) == 'function') {
				callback(responseText);
			}
			else {
				$('#write_review_container').html(responseText);
				if ($("#write_review_form").length) {
					setupCaptcha();
				} else {
					$('.reviews').addClass('sent');
				}
			}
		}
	});
}

function showReviewForm(callback) {
	if (!submitProcessStart()) return;

	var param = {
		product: $("#product").val()
	};
	var container = $('#write_review_container').html('');

	$.post('/product/review/form/', param, function (responseText, textStatus) {
		if (responseText.indexOf('STATUS_OK') == -1) {
			window.location.reload(true);
		}
		else {
			container.html(responseText);
			$('.reviews').addClass('opened').removeClass('sent');
			setupCaptcha();
			if (typeof(callback) == 'function') {
				callback();
			}
		}
		submitProcessStop();
	});
}

function setupCaptcha() {
	$("#captcha_image").attr('src', routes.captcha + '?_' + (new Date().getTime()));
}

function updateDelivery() {
	var delivery = $("input[name=delivery][checked]").val();
	$(".dose_container").hide().filter("." + delivery).show();
	$("label").parent().removeClass('ch');
	$("label." + delivery).parent().addClass('ch');
}

function emptyCart(is_back) {
	if ( confirm(msgs.emptyCart) ) {
		var url = routes.cart_empty;
		if (is_back) url += '?' + $.param( { back: window.location.href } );
		goToURL(url);
	}
}

function searchInputFocus(el) {
	if ($(el).val() !== '') {
		$('.search__drop').show();
		$('#quick_search_results').show();
	}
}

$(document).ready(function(){
	// Try to load site copy data from cookies
	if (typeof scd != 'object' && typeof getSCD == 'function') {
		scd = getSCD('SCD');
	}

	// Bookmarks
	var reSiteURL   = new RegExp('\%site_url\%', "g");
	var reSiteTitle = new RegExp('\%site_title\%', "g");
	$(".bookmarks a").each(function () {
		var url = $(this).attr('href');
		url = url.replace(reSiteURL, location.protocol+'//'+location.host);
		url = url.replace(reSiteTitle, msgs.siteTitle);
		$(this).attr('href', url);
	});

	// Captcha
	setupCaptcha();

	// Disable cache for ajax
	$.ajaxSetup({ cache: false });

	// Fix bug with anchors
	if (document.location.hash)
		document.location.hash = document.location.hash;


	// preventing resubmit the form
	$('#track_my_order, #contact_us, #report_spam').submit(function() {
		return submitProcessStart();
	});

});
