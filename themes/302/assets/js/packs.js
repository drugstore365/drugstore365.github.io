$(document).ready(function() {
	$('.pack-pill .hover').click(function (e) {
		e.preventDefault();
		var el = $(this);

		if (!el.hasClass('active')) {
			$('.pack-pill__tip').hide();
			$('.pack-pill .hover').removeClass('active');
			el.parent().find('.pack-pill__tip').show();
		} else {
			el.parent().find('.pack-pill__tip').hide();
		}
		el.toggleClass('active');
	});

	/*menu scrollTo*/
	$('.menu .pack, .pack, .star-packs__item a, .star-packs__item .star-packs__price').click(function(e){
		var el = $(this).attr('href') ? $(this).attr('href') : $(this).closest('tr').find('a').attr('href');
		if (el !== '' && el[0] == '/') {
			return;
		}
		e.preventDefault();
		$(window).scrollTo(el, 800,{offset:{left:0,top:-10}});
		$(el).find('.product__btn').click();
	});

	if ($('.product-big').length) {
		$('.product-big__tabs__controls ul li a').on('click', function (e) {
			e.preventDefault();
			$('.product-big__tabs__controls ul li a').removeClass('active');
			var el = $(this).addClass('active').parent();
			el.closest('.product-big__tabs').find('.product-big__tabs__layers .item').css('display', 'none').eq(el.index()).show();
		});

		$('.product__main__img .img a, .product__btn').on('click', function (e) {
			e.preventDefault();
			var el = $(this);
			var box = $(el.attr('href'));
			$('.product_i').removeClass('open');
			el.closest('.product_i').addClass('open');

			$('.product-list__row').css('padding-bottom', '0');
			$('.packs-list__item-descr').removeClass('active');
			$('.icon_cart-corner').removeClass('open');
			$.scrollTo(box, 800, {offset: {top: -10}});
			//if (!mobile) {
				el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
			//}
		});

		$('.product__main__img .more').on('click', function (e) {
			e.preventDefault();
			var el = $(this);
			var box = $(el.attr('href'));
			box.find('.more-info').click();

			$('.product_i').removeClass('open');
			el.closest('.product_i').addClass('open');

			$('.product-list__row').css('padding-bottom', '0');
			$('.packs-list__item-descr').removeClass('active');
			$('.icon_cart-corner').removeClass('open');
			$.scrollTo(box, 800, {offset: {top: -10}});
			//if (!mobile) {
				el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
//			}
		});

		$('.product-big .more-info').on('click', function (e) {
			e.preventDefault();
			var el = $(this);
			if (!el.parent('.product-big').find('.product-big__tabs').hasClass('open')) {
				el.closest('.product-big').find('.product-big__tabs').addClass('open');
				$('.product-list__row').css('padding-bottom', '0');
				el.closest('.product-big').find('.product-big__tabs__controls ul li a').eq(0).addClass('active');
				el.closest('.product-big').find('.product-big__tabs__layers .item').eq(0).fadeIn();
				el.closest('.product-big').find('.product-big__hide').addClass('open');
				//if (!mobile) {
					el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
				//}
			}
			else{
				$('.product-big__tabs').removeClass('open');
				$('.product-list__row').css('padding-bottom', '0');
				$('.product-big__hide').removeClass('open');
				//if (!mobile) {
					el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
				//}
			}
		});

		$('.product-big__hide a').on('click', function (e) {
			e.preventDefault();
			var el = $(this);

			el.closest('.product-big').find('.more-info').removeClass('open');
			el.closest('.product-big__hide').removeClass('open');
			$('.product-big__tabs').removeClass('open');
			$('.product-list__row').css('padding-bottom', '0');

			//if (!mobile) {
				el.closest('.product-list__row').css('padding-bottom', el.closest('.product_i').find('.product-big').outerHeight());
			//}
		});

		$('.product-big .close').on('click', function (e) {
			e.preventDefault();
			var el = $(this);

			$('.product_i').removeClass('open');
			$('.product-big__tabs').removeClass('open');
			$('.product-list__row').css('padding-bottom', '0');
			$('.product-big__hide').removeClass('open');
		});
	}

	$('.hide-and-order').on('click', function (e) {
		e.preventDefault();
		var box = $(this).closest('.product-big');
		box.find('.product-big__tabs').removeClass('open');
		box.find('.product-big__hide').removeClass('open');
		//if (!mobile) {
			box.closest('.product-list__row').css('padding-bottom', box.closest('.product_i').find('.product-big').outerHeight());
		//}
	});

	$(document).click(function(e){
		if ($(e.target).closest('.tip-content').length==0 && (!$(e.target).hasClass('descr'))){
			$('.tip-content').hide();
		}
	});

	$(document).click(function(e){
		var el = $(e.target);
		if (el.parent().hasClass('pack-pill')) {
			return;
		}
		if (!el.parents('.pack-pill__tip').length) {
			$('.pack-pill__tip').hide();
			$('.pack-pill .hover').removeClass('active');
		}
	});

	var divs = $("div.star-packs__item");
	var count = divs.length;
	var colcount = Math.ceil(count / 3);
	for(var i = 0; i < divs.length; i += colcount) {
		var td = (i >= colcount) ? "<td/>" : "<td class='first'/>";
		divs.slice(i, i + colcount).wrapAll(td);
	}
	$(".star-packs td").wrapAll("<tr/>");
	$(".star-packs tr").wrapAll("<table/>");

	divs = $("div.packs-list__item");
	for(var i = 0; i < divs.length; i += 3) {
		$(divs[i]).addClass("packs-list__item_first");
		divs.slice(i, i + 3).wrapAll("<div class='packs-list__row clearfix'/>");
	}

	divs = $("div.paks-list__item-descr");
	for(var i = 0; i < divs.length; i += 3) {
		divs.slice(i, i + 3).wrapAll("<div class='packs-descr clearfix'/>");
	}

	divs = $("div.packs-descr");
	var packitems = $("div.packs-list__row");
	for(var i = 0; i < packitems.length; i ++) {
		packitems[i].appendChild(divs[i]);
	}

    (function() {
        var zIndexNumber = 1000;
        $('.rating-box td').each(function() {
                $(this).css('zIndex', zIndexNumber);
                zIndexNumber -= 10;
            });
    })();
});
