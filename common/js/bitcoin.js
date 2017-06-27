function renderQRcode(selector, amountReceived){
	if(selector !== undefined){
		var address = $('[data-address]').data('address');
		var amount = $('[data-amount]').data('amount');
		if (amountReceived !== undefined) {
			amount = (amount - amountReceived).toFixed(8);
		}
		var btcLink = 'bitcoin:'+address+'?amount='+amount;
		if(btcLink && btcLink.length){
			$(selector).find('canvas').remove();
			$(selector).qrcode({width: 110,height: 110,text: btcLink.trim()});
		}
	}

	return false;
}

function copyAddress() {
	var orderBlock =  $('.container-bitcoin');
	var address = $('#copyText').data('address');
	var temp = document.createElement('input');
	orderBlock.append(temp);
	$(temp).val(address).select();

	try {
		document.execCommand("copy");
	} catch(e) {
		console.log('Unable to copy');
	}

	$(temp).remove();
}

function checkTransaction(button) {
	var buttonActive = $('.btn-sent.active');
	if (getCookie('address_check')) {
		defaultTransactionData();
		return;
	}

	if (button != undefined) {
		$(button).hide();
		buttonActive.show();
	}

	var now = new Date();
	now.setTime(now.getTime() + 120 * 1000);
	document.cookie = "address_check="+now.getTime()+"; expires=" + now.toUTCString() + "; path=/checkout/status";

	$.ajax({
		url: "/checkout/address_check/",
		cache : false,
		method: "GET",
		data: {
			'shipping_name' : $('.billing-cart__title p').data('shipping-name')
		}
	}).done(function(data, textStatus) {
		var dataObj = $('<div/>').html(data);
		if($(dataObj).find('p.infoText').length){
			var pText = $(dataObj).find('p.infoText');
			var amountReceived = pText.data('amountreceived');
			$('#info_text').html(pText);
			$('.paid-block > .sum').text(amountReceived + ' BTC');
			$('.steps-1').removeClass('steps-1').addClass('steps-2');
			$('.steps-2').removeClass('steps-0');
			renderQRcode('#qrcode', amountReceived);
		} else if($(dataObj).find('div.steps-4').length){
			$('#payment_status').html(data);

			setTimeout(preloader, 1200);

			clearInterval(window.checkTransactionID);
		} else {
			defaultTransactionData();
		}
		if (button != undefined) {
			$(button).show();
			buttonActive.hide();
		}
	});

}

function defaultTransactionData() {
	var pText = $('#bitcoin').find('#infoText p');
	var amountReceived = pText.data('amountreceived') ? pText.data('amountreceived') : 0;
	if (pText.length > 0) {
		$('#info_text').html(pText);
	}
	$('.paid-block > .sum').text(amountReceived + ' BTC');
	$('.steps-1').removeClass('steps-1').addClass('steps-2 steps-0');
}

function close_accordion_section() {
	$('.accordion .accordion-section-title').removeClass('active');
	$('.accordion .accordion-section-content').slideUp(500).removeClass('open');
}

function animateAd(stepName) {
	$('.' + stepName + ' .loader-block').find('img').eq(0).addClass('img-0 preloader-right');
}

function animateStep0(stepName) {
	$('.' + stepName + ' .preloader-right').one(
		'webkitAnimationEnd oanimationend msAnimationEnd animationend',
		function() {

			if ($(this).hasClass('preloader-right')) {

				$(this).removeClass('preloader-right');
				$(this).siblings('img').eq(0).addClass('img-1 preloader-fadeIn');
			}
		}
	);
}

function animateStep1() {
	var imgFind1 = $('.steps-3 .img-1'),
		imgFind2 = $('.steps-4 .img-1');

	if (imgFind1.length > 0 || imgFind2.length > 0) {
		$(imgFind1).removeClass('preloader-fadeIn').addClass('preloader-fadeOut');
		$(imgFind2).removeClass('preloader-fadeIn').addClass('preloader-fadeOut');
	}
}

function animateStep3() {
	$('.steps-3 img, .steps-4 .img-1').removeAttr('class');
}

function animateStep4() {
	$('.dear-block').fadeIn('slow');
	$('.steps-4 img:last-child').fadeIn( function() {$(this).animate({opacity : '1'}, 1000);});
}

function preloader() {
	animateAd('steps-4');
	animateStep0('steps-4');
	setTimeout(animateStep1, 2200);
	setTimeout(animateStep3, 2600);
	setTimeout(animateStep4, 2700);
}


function getBrowser(){

	var ua=navigator.userAgent,tem,M=ua.match(/(opera|edge|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if(/trident/i.test(M[1])){
		tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
		return {name:'IE',version:(tem[1]||'')};
	}
	if(M[1]==='Chrome'){
		tem=ua.match(/\bOPR\/(\d+)/)
		if(tem!=null)   {return {name:'Opera', version:tem[1]};}
		tem=ua.match(/\edge\/(\d+)/i)
		if(tem!=null)   {return {name:'Edge', version:tem[1]};}
	}
	M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
	if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
	return {
		name: M[0],
		version: M[1]
	};
}

$(document).ready(function(){
	jQuery(function ($) {
		/* accordion */
		$('.accordion-section-title').click(function(e) {
			var currentAttrValue = $(this).attr('href');

			if($(e.target).closest('.accordion-section-title').is('.active')) {
				close_accordion_section();
			}else {
				close_accordion_section();

				$(this).addClass('active');
				$('.accordion ' + currentAttrValue).slideDown(300).addClass('open');
			}

			e.preventDefault();
		});
		$('.accordion a').eq(0).click();
	});

	var browser = getBrowser(),
		browserName = browser.name,
		browserVersion = browser.version,
		body = $('body'),
		ieMarker = false;

	if ( browserName == 'MSIE' && browserVersion == '9' ) {
		body.addClass('ie9');
	} else if (	browserName == 'MSIE' && browserVersion == '8' ){
		body.addClass('ie8');
		ieMarker = true;
	} else if (	browserName == 'MSIE' && browserVersion == '7' ){
		ieMarker = true;
		body.addClass('ie7');
	}else if (	browserName == 'Safari' ){
		body.addClass('safari');
	}

	if( $("#bitcoin").length && ieMarker == false){
		window.renderQRcode('#qrcode');
	}
});