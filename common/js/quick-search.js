
function QuickSearch(element) {
	this.element      = element;
	this.container    = null;
	this.options      = [];
	this.selected     = -1;
	this.minInput     = 3;
	this.query        = '';
	this.isLoading    = false;
	this.timeoutID    = null;
	this.limit        = 10;
	this.showElements = 5;
	this.cache        = {};
	this.currency     = null;
	this.language     = null;
	this.vocabulary   = null;
}

QuickSearch.prototype.init = function() {
	var self = this;

	if (!self.vocabulary || self.vocabulary.length == 0) {
		self.vocabulary = vocabulary;
	}

	this.element.attr('autocomplete', 'off');

	this.element.bind('keypress', function(event){
		var input = $(this);
		var key = event.which || event.keyCode;
		if (key == 27) { // escape
			input.val('').blur();
			self.close();
		}
		else if (key == 13) { // enter
			var href = self.results.find('li.selected a').attr('href');
			if (href) {
				window.location = href;
			} else {
				$(this).parents('form').submit();
			}
			event.preventDefault();
		}
		else if (key == 40) { // down
			self.next();
			event.preventDefault();
		}
		else if (key == 38) { // up
			self.prev();
			event.preventDefault();
		}
	});

	this.element.bind('keyup', function(event){
		if (self.timeoutID) {
			clearTimeout(self.timeoutID);
		}
		self.timeoutID = setTimeout(function() { self.sendQuery() }, 300);
	});

	this.element.bind('blur', function(e){
		self.close();
	});

	if ( $('#quick_search_results').length > 0 ) {
		this.results = $('#quick_search_results');
		this.container = $('.search__drop');
	} else {
		this.container = this.results = $('<ul/>')
			.attr('id', 'quick_search_results')
			.hide()
			.insertAfter(this.element)
		;
	}

	this._detectLanguageAndCurrency();

	this.close();
}

QuickSearch.prototype.sendQuery = function() {
	var self = this;
	var query = self.element.val();
	if (query != self.query && query.length >= self.minInput) {
		if (self.cache[query]) {
			self.render(self.cache[query]);
		} else if (self.isLoading == false) {
			self.isLoading = true;
			$.ajaxSetup({ global: false });
			var params = { search: query, limit: self.limit, json: 1 };
			if (self.currency) {
				params.currency = self.currency;
			}
			if (self.language) {
				params.language = self.language;
			}
			$.getJSON(routes.search, params, function(data) {
				self.cache[query] = data;
				self.render(data);
				self.isLoading = false;
			});
			$.ajaxSetup({ global: true });
		}
	}
	self.query = query;
}

QuickSearch.prototype.render = function(data) {
	this.options = data;
	this.selected = -1;
	this.results.children().remove();
	for (var i in data) {
		if (i > this.showElements) {
			break;
		}
		if ( this.results.hasClass('full') ) {
			this._renderItemFull(data[i]);
		} else {
			this._renderItemSimple(data[i]);
		}
	}
	if (this.results.children().length > 0) {
		this.open();
	}
}

QuickSearch.prototype._renderItemFull = function(item) {
	var image = $('<img/>')
		.attr('src', '/' + item.image)
		.attr('title', item.title)
		.attr('width', 75)
		.attr('height', 75)
	;

	var description = item.description;
	if (description.length > 100) {
		description = description.substr(0, 100) + '...';
	}

	var shipping_methods = $('<div/>').addClass('text-delivery');
	$.each(item.shipping_methods, function(i, name){
		var item = $('<span/>').html(name);
		shipping_methods.append(item);

		// Add shipping description tooltip if possible
		if ( $.fn.ezpz_tooltip && window.shippingMethodTooltipConfig ) {
			item.ezpz_tooltip({
				contentId: shippingMethodTooltipConfig.map[name.toLowerCase()],
				contentPosition: shippingMethodTooltipConfig.position
			});
		}
	});

	var orderButton;
	var orderCaption = this.vocabulary.order[this.language];
	if (window.orderButtonTemplate) {
		orderButtonTemplate = orderButtonTemplate.replace('Order now', orderCaption);
		orderButton = $(orderButtonTemplate);
		(orderButton.is('a') ? orderButton : orderButton.find('a'))['attr']('href', item.product_link);
	} else {
		orderButton = $('<a/>').attr('href', item.product_link).addClass('btn-search').html(
			orderCaption
		);
	}

	var container = this.vocabulary['container'][item.container][ this.language ];
	if (!container) {
		container = item.container;
	}

        var generic;
        if (item.generic){
            generic = " (" + item.generic + ")";
        } else {
            generic = "";
        }
	var info = $('<div/>')
		.addClass('text')
		.append(
			$('<div/>').addClass('text-title').html(item.title + generic)
		)
		.append(shipping_methods)
		.append(
			$('<div/>').addClass('text-descr').html(description)
		)
		.append(
			$('<div/>')
				.addClass('btns clearfix')
				.append(orderButton)
				.append(
					$('<div/>').addClass('text-price').append(
						this.vocabulary['from'][ this.language ] + ' ' +
						'<span>'   + item.currency      + '</span> '   +
						'<strong>' + item.cost_per_pill + '</strong> ' +
						this.vocabulary['per'][ this.language ] + ' ' +
						container
					)
				)
		)
	;

	var li = $('<li/>')
		.addClass('clearfix')
		.append( $('<a/>').attr('href', item.product_link).addClass('img').append(image) )
		.append(info)
	;
        li.hover(
                function(){
                    $(this).attr({style: "cursor: pointer"});
                },
                function(){
                    $(this).removeAttr("style");
                }

        );
        li.click(function(){
            document.location.href=item.product_link;
        });
	this.results.append(li);
}

QuickSearch.prototype._detectLanguageAndCurrency = function() {
	this.language = this.element.parents('form').attr('data-language');
	this.currency = this.element.parents('form').attr('data-currency');
}

QuickSearch.prototype._renderItemSimple = function(item) {
	var link = $('<a/>')
		.attr('href', item.product_link)
		.html(item.title)
	;
	this.results.append( $('<li/>').append(link) );
}

//QuickSearch.prototype.submit = function() {
//	if (this.element.val() === '') {
//		alert('Empty search string');
//	}
//	else if (this.element.val().length < this.minInput) {
//		alert('Minimum allowed length is ' + this.minInput + ' characters');
//	} else {
//		this.element.parents('form').submit();
//	}
//}

QuickSearch.prototype.next = function() {
	this.selected += 1;
	if (this.selected >= this.results.children().length) {
		this.selected = this.results.children().length - 1;
	}
	this.results.children()
		.removeClass('selected')
		.eq(this.selected)
		.addClass('selected')
	;
}

QuickSearch.prototype.prev = function() {
	this.selected -= 1;
	if (this.selected < 0) {
		this.selected = -1;
		this.results.children().removeClass('selected');
	}
	this.results.children()
		.removeClass('selected')
		.eq(this.selected)
		.addClass('selected')
	;
}

QuickSearch.prototype.close = function() {
    var self = this;
    self.container.animate({ opacity: 0.99 }, 500, function() {
        $('body').removeClass('quick-search-open');
        self.container.slideUp(400);
    });
}

QuickSearch.prototype.open = function() {
    $('body').addClass('quick-search-open');
    this.container.slideDown(400);
}

$(document).ready(function(){
	var el = $('#search').find('input[name=search]');
	if (el.length == 1) {
		var quickSearch = new QuickSearch(el);
		quickSearch.init();
	}
});