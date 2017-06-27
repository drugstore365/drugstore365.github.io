$(document).ready(function(){
	$('#form_cart')
		.on('click', '.cart-shipping', function (e) {
			e.preventDefault();
			var el = $(this);
			el.closest('.shipping').find('input[name="shipping_method_id"]').val(el.data('id')).trigger('change');
		})
		.on('click', '.cart-bonus', function (e) {
			e.preventDefault();
			var el = $(this);
			el.closest('.bonus-choose').find('input[name="bonus_product_id"]').val(el.data('id')).trigger('change');
		});

	$('.shipping-type a').not('.shipping-type a.inactive').on('click', function (e) {
		e.preventDefault();
		var el = $(this);
		el.addClass('active');
		$('.shipping-type a').not(el).removeClass('active');
	});

	$('.bonus-choose a').on('click', function (e) {
		e.preventDefault();
		var el = $(this);
		el.addClass('active');
		$('.bonus-choose a').not(el).removeClass('active');
	});

	initCheckbox();
});