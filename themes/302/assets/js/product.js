$(document).ready(function(){
	$('.tab-box__controls a').on('click',function (e) {
		e.preventDefault();
		var el = $(this),
			layers = $('.tab-box__layers .item');
		$('.tab-box__controls a').removeClass('active');
		el.addClass('active');
		layers.not(layers.eq(el.parent().index())).css('display', 'none');
		layers.eq(el.parent().index()).fadeIn();
	}).eq(0).click();

	$('.prod-data .title').on('click', function (e) {
		e.preventDefault();
		$('.prod-data').toggleClass('open');
		$('.prod-data_i').slideToggle();
	});

	$('.comments__show').on('click', function (e) {
		e.preventDefault();
		$(this).toggleClass('closed');
		$('.comments__list').slideToggle();
	});

	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // ESC
			coupon.close();
			$('.bonus-popup').hide();
		}
	});

	$('.btn-bonus').click(function(event) {
		event.preventDefault();
		$('.bonus-popup').not($(this).parent().find('.bonus-popup')).hide();
		$(this).parent().find('.bonus-popup').toggle();
		$('div.body').toggleClass('bns-open');
		return false;
	});

	(function(){
		var enableTab = function() {
			$($(this).parents('.tabs').get(0)._active).removeClass('spr_prod_tab_bg act');
			$($(this).parents('.tabs').get(0)._active._prev).removeClass('b-act');
			$($(this).parents('.tabs').get(0)._active._info).hide();
			$(this).addClass('spr_prod_tab_bg act');
			$(this._prev).addClass('b-act');
			$(this._info).show();
			$(this).parents('.tabs').get(0)._active = this;
		};

		var prev_tab = null;

		$('.dose_container div.tab').each(function(i, tab) {
			if ($(tab).hasClass('act')) {
				$(tab).parents('.tabs').get(0)._active = tab;
				prev_tab = null;
			}
			tab._info = $('.dose.'+ tab.id, $(tab).parents('.dose_container')).get(0);
			tab._prev = prev_tab;
			prev_tab = tab;
			$(tab).click(enableTab);
		});
	})();

	$('.toggle-dosage').click(function (e) {
		e.preventDefault();
		scrollToId('.count-table');

		var dosage = $(this).attr('id').replace(/^d/, '');
		$('.count-table .controls').find("a").filter(function() {
			return $(this).text() === dosage;
		}).click();
	});

	$('.type__title').on('click', function(e){
		e.preventDefault();
		$('.type__drop').fadeToggle();
	});

	$('body').on('click', '.count-table .controls a', function (e) {
		e.preventDefault();
		var el = $(this);
		if (el.hasClass('active')) {
			return;
		}
		$('.count-table .controls a').removeClass('active');
		el.addClass('active');
		$('.count-table .layers .item').hide();
		$(el.attr('href')).fadeIn();
	});
});