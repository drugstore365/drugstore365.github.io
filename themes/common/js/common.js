var submitProcessed = 0;

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
	$('.btn-orange').hide();
	$('.confirm-place').show();
	$('.btn-orange.fake_button').show();
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

function setupCaptcha() {
	$("#captcha_image").attr('src', routes.captcha + '?_' + (new Date().getTime()));
}

function emptyCart(is_back) {
	if ( confirm(msgs.emptyCart) ) {
		var url = routes.cart_empty;
		if (is_back) url += '?' + $.param( { back: window.location.href } );
		goToURL(url);
	}
}

function searchInputFocus(el) {
	var container = $('#quick_search_results');
	if ($(el).val() !== '' && container.children().length > 0) {
		$('.search__drop').show();
		container.show();
	}
}

function selectInit() {
	$('select').each(function () {
		$(this).siblings('span').html($("option:selected", this).text());
	});
}

function changeSelect() {
	$('select').on('change', function(){
		$(this).siblings('span').html($("option:selected", this).text());
	});
}

function scrollToId(selector, offsetTop) {
	if (offsetTop === undefined) {
		offsetTop = 0;
	}
	var top = $(selector).offset().top;
	$('body, html').animate({
		scrollTop: top - offsetTop
	}, 1000);
}

(function (a) {
	a.fn.formtips = function (b) {
		var c = a.extend({tippedClass: "tipped"}, b);
		return this.each(function () {
			var b = a(this);
			var d = a(b).attr("type");
			if (d != "file" && d != "checkbox" && d != "radio") {
				a(b).bind("focus", function () {
					var b = a(this).attr("title");
					if (a(this).val() == b) {
						a(this).val("").removeClass(c.tippedClass)
					}
					return true
				});
				a(b).bind("blur", function () {
					var b = a(this).attr("title");
					if (a(this).val() == "") {
						a(this).val(b).addClass(c.tippedClass)
					}
					return true
				});
				var e = a(b).attr("title");
				if (a(b).val() == "" || a(b).val() == a(this).attr("title")) {
					a(b).val(e).addClass(c.tippedClass)
				} else {
					a(b).removeClass(c.tippedClass)
				}
				a(b).parentsUntil("form").parent().submit(function () {
					var d = a(b).attr("title");
					if (a(b).val() == d) {
						a(b).val("").removeClass(c.tippedClass)
					}
				})
			}
		})
	}
})(jQuery);

function printPage() {
	var hidden = '.status_hidden';

	$(hidden).show();
	window.print();
	$(hidden).hide();
}

$(document).ready(function(){

	selectInit();
	changeSelect();

	// Captcha
	setupCaptcha();
	//
	// Disable cache for ajax
	$.ajaxSetup({ cache: false });

	// Fix bug with anchors
	if (document.location.hash)
		document.location.hash = document.location.hash;

	// preventing resubmit the form
	$('#contact_us, #report_spam').submit(function() {
		return submitProcessStart();
	});

});
