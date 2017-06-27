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
		if (typeof updateInvoice == 'function') {
			updateInvoice(responseText);
		}
		if(typeof radioInit == 'function') {
			radioInit();
		}
		if (typeof initCheckbox == 'function') {
			initCheckbox();
		}
		if (typeof $('input[title]').formtips == 'function'){
			$('input[title]').formtips();
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
			if (typeof updateInvoice == 'function') {
				updateInvoice(responseText);
			}
		}
		submitProcessStop();

		if(typeof selectInit == 'function') {
			selectInit();
		}
	});
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
				if (typeof updateInvoice == 'function') {
					updateInvoice(responseText);
				}
				if (typeof initCheckbox == 'function') {
					initCheckbox();
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

function updateInvoice(responceText) {
	var selector = $('span.invoice-bottom'),
		total = $(responceText).find('input#total-usd').val();

	selector.html(total);
}

function initCheckbox() {
	$('.checkbox__label').click(function(e) {
		e.preventDefault();
		var inputCheckbox = $(this).parent().find('input');
		if ($(this).hasClass('disabled')){
			return false;
		}
		if(inputCheckbox.prop('checked') == true){
			$(this).removeClass('checked');
			inputCheckbox.prop('checked', false).change();
		} else {
			$(this).addClass('checked');
			inputCheckbox.prop('checked', true).change();
		}
		return false;
	});
}