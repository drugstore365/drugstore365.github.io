$(document).ready(function(){

/* fix for IE < 8 */
if (!window.console) console = {log: function() {/* nothing */}};


function CookieStorage(options) {
	this.options            = {};
	this._buffer            = [];
	this._request           = null;

	this._parseOptions(options);

	this.debug('cookieStorage: initialized');

	return true;
}

CookieStorage.prototype._parseOptions = function(options) {
	var defaultOptions = {
		itemSeparator:      '!',
		debug:              false,
		serverUrl:          '/heatmap_click/',
		sendDelay:          5000,
		requestTimeout:     10000,
		cookieName:         'heatmap',
		maxCookieSize:      512
	};

	this.options = options = $.extend({}, defaultOptions, options || {});

	if ( options.serverUrl == '' ) {
		throw new Error('cookieStorage: Wrong format of the "serverURL"');
	}
	if ( !options.sendDelay.toString().match(/^[0-9]{1,6}$/) ) {
		throw new Error('cookieStorage: Wrong format of the "sendDelay"');
	}
	if ( !options.cookieName.match(/^[0-9a-z_-]{1,30}$/) ) {
		throw new Error('cookieStorage: Wrong format of the "cookieName"');
	}
	if ( !options.maxCookieSize.toString().match(/^[0-9]{1,6}$/) ) {
		throw new Error('cookieStorage: Wrong format of the "maxCookieSize"');
	}
	if ( !options.requestTimeout.toString().match(/^[0-9]{1,6}$/) ) {
		throw new Error('cookieStorage: Wrong format of the "requestTimeout"');
	}
};

CookieStorage.prototype.debug = function(msg) {
	if (this.options.debug) {
		console.log(msg);
	}
};

CookieStorage.prototype.save = function(data) {
	this.debug('cookieStorage: save data to buffer');

	this._buffer.push(data);

	if (!this._request) {
		this._prepareData();
	}
};

CookieStorage.prototype._prepareData = function() {
	this.debug('cookieStorage: prepare data');

	var cookieData = getCookie(this.options.cookieName) || '';
	var item;
	while ( item = this._buffer.shift() ) {
		var newCookieData = cookieData + (cookieData.length ? this.options.itemSeparator : '') + item;
		if (newCookieData.length > this.options.maxCookieSize) {
			this.debug('cookieStorage: cookies size limit is exceeded');
			this._buffer.unshift(item);
			break;
		}
		cookieData = newCookieData;
	}

	if (cookieData.length) {
		setCookie(this.options.cookieName, cookieData, null, '/');
		return true;
	}

	return false;
};

CookieStorage.prototype._delayExpired = function() {
	var now   = new Date().getTime();
	var delay = now - (this.getLastSent() || now);
	return delay >= this.options.sendDelay;
};

CookieStorage.prototype.send = function(force, callback) {
	if (this._request) {
		this.debug('cookieStorage: sending in progress will try later');
		if (callback) {
			callback();
		}
		return;
	}

	if ( !this._prepareData() ) {
		this.debug('cookieStorage: no data to send');

		this.setLastSent( new Date().getTime() );

		if (callback) {
			callback();
		}

		return;
	}

	if ( !force && !this._delayExpired() ) {
		this.debug('cookieStorage: will wait and try later');

		if (callback) {
			callback();
		}
		return;
	}

	this._send(callback);
};

CookieStorage.prototype._send = function(callback) {
	this.debug('cookieStorage: send data');

	/* save context */
	var context = this;
	this._request = $.ajax({
		url:     this.options.serverUrl,
		cache:   false,
		timeout: this.options.requestTimeout,
		global:  false,
		success: function(data, textStatus) {
			context.debug('cookieStorage: sent successfully, status=' + textStatus + ' data=' + data);
			if (data == 'OK') {
				deleteCookie(context.options.cookieName, '/');
				context.setLastSent( new Date().getTime() );
			}
		},
		error:    function(req, textStatus) {
			context.debug('cookieStorage: sent failed, status=' + textStatus);
		},
		complete: function() {
			context._request = null;
			if (callback) {
				callback();
			}
		}
	});
};

CookieStorage.prototype.abortSending = function() {
	this.debug('cookieStorage: abortSending');
	if (this._request) {
		this._request.abort();
	}
};

CookieStorage.prototype.getLastSent = function() {
	var time = getCookie(this.options.cookieName + 'T');
	if (!time) {
		time = new Date().getTime();
		this.setLastSent(time);
	}
	return time;
};

CookieStorage.prototype.setLastSent = function(value) {
	setCookie(this.options.cookieName + 'T', value, null, '/');
};

function Heatmap(options) {
	this.options           = {};
	this._timer            = null;
	this._browser          = 'unknown';

	this._parseOptions(options);
	this._detectBrowser();
	this._registerEventHandlers();
	this._initTimer();

	this.debug('heatmap: initialized');
};

Heatmap.prototype._parseOptions = function(options) {
	var defaultOptions = {
		paramSeparator:    '.',
		debug:             false,
		siteId:            0,
		clickStorage:      null,
		sendInterval:      1000,
		postClick:         null
	};

	this.options = options = $.extend({}, defaultOptions, options || {});

	if ( !options.siteId.toString().match(/^[0-9]{1,6}$/) ) {
		throw new Error('heatmap: Wrong format of the site ID');
	}
	if ( !options.clickStorage ) {
		throw new Error('heatmap: "clickStorage" is not defined');
	}
	if ( !options.sendInterval.toString().match(/^[0-9]{1,6}$/) ) {
		throw new Error('heatmap: Wrong format of the "sendInterval"');
	}
};

Heatmap.prototype.debug = function(msg) {
	if (this.options.debug) {
		console.log(msg);
	}
};

Heatmap.prototype.stop = function(force) {
	this.debug('heatmap: stopped');
	if (this._timer) {
		clearInterval(this._timer);
		this._timer = null;
		if (force) {
			this.options.clickStorage.abortSending();
		}
	}
	this._unregisterEventHandlers();
};

Heatmap.prototype.active = function() {
	return this._timer ? true : false;
};

Heatmap.prototype._initTimer = function() {
	if (this._timer) {
		clearInterval(this._timer);
	}
	/* save context */
	var context = this;
	this._timer = setInterval(function() {
		context.options.clickStorage.send();
	}, this.options.sendInterval);
};

Heatmap.prototype._registerEventHandlers = function() {
	/* save context */
	var context = this;
	$(document).unbind('.heatmap').bind('mousedown.heatmap', function(event){
		context._eventHandler(event);
	});
},

Heatmap.prototype._unregisterEventHandlers = function() {
	$(document).unbind('.heatmap');
},

Heatmap.prototype._detectBrowser = function() {
	var userAgent = navigator.userAgent
		? navigator.userAgent.toLowerCase().replace(/-/g, '')
		: ''
	;

	var browsers = ['android', 'blackberry', 'iphone', 'ipad', 'chrome', 'firefox', 'safari', 'msie', 'opera'];

	this._browser = 'unknown';
	for (var i = 0; i < browsers.length; i++) {
		if (userAgent.indexOf( browsers[i] ) !== -1) {
			this._browser = browsers[i];
			break
		}
	}
};

Heatmap.prototype._detectPage = function() {
	var matched = window.location.pathname.match(/^\/(about|cart|cert|contact_us|herbal|faq|more_info|packs|product|policies|report_spam|track_my_order)\//);
	var page    = matched ? matched[1] : 'main';

	if (page == 'cart') {
		page = $("#form_cart").length ? 'cart_full' : 'cart_empty';
	}

	return page;
};

Heatmap.prototype._eventHandler = function(event) {
	if (!event) {
		event = window.event
	}

	this.debug('heatmap: event type=' + event.type + ' target=' + event.target);

	var click;
	try {
		click = this._processClick(event);
	} catch(e) {
		this.debug(e);
	}

	if (click) {
		this._saveClick(click);
	}

	if (this.options.postClick) {
		this.options.postClick();
	}
};

Heatmap.prototype._saveClick = function(click) {
	var serializedData = [
		this.options.siteId,
		click.page,
		click.x,
		click.y,
		click.width,
		this._browser,
		1
	].join(this.options.paramSeparator);
	this.options.clickStorage.save(serializedData);
};

Heatmap.prototype._processClick = function(event) {
	var button = event.which || event.button;

	var leftButton = 0 ; /*this._browser == 'msie' ? 1 : 0*/
	if (button == leftButton) {
		this.debug('heatmap: Not button pressed');
		return;
	}

	var doc       = document.documentElement && document.documentElement.clientHeight !== 0
		? document.documentElement
		: document.body
	;
	var x         = event.clientX;
	var y         = event.clientY;
	var width     = doc.clientWidth  || window.innerWidth;
	var height    = doc.clientHeight || window.innerHeight;
	var left      = window.pageXOffset || doc.scrollLeft;
	var top       = window.pageYOffset || doc.scrollTop;
	var maxWidth  = Math.max(doc.scrollWidth,  doc.offsetWidth,  width);
	var maxHeight = Math.max(doc.scrollHeight, doc.offsetHeight, height);

	if (x > width || y > height) {
		this.debug('heatmap: Out of document');
		return;
	}

	x += left;
	y += top;

	if (x < 0 || y < 0 || x > maxWidth || y > maxHeight) {
		this.debug('heatmap: Out of document');
		return;
	}

	var click = {
		x:     x,
		y:     y,
		width: width,
		page:  this._detectPage()
	};

	this.debug('heatmap: click ' + $.param(click));

	return click;
};

try {
	var cookieStorage = new CookieStorage({
		//debug:          true,
		serverUrl:      '/heatmap_click/',
		sendDelay:      5000,
		requestTimeout: 5000,
		cookieName:     'heatmap',
		maxCookieSize:  512
	});
	var heatmap = new Heatmap({
		//debug:          true,
		siteId:         getCookie('site_id'),
		clickStorage:   cookieStorage,
		sendInterval:   1000
	});

	/* bind to elements with external links */
	var localUrl    = location.protocol + '//' + location.host;
	var checkoutUrl = 'javascript:checkout()';
	$('a[href^=http]').not('[href^="' + localUrl + '"]').add('a[href^="' + checkoutUrl + '"]').bind('click', function(event){
		if (!event) {
			event = window.event
		}

		/* Fix for Chrome when middle button is pressed */
		if (event.which === 2) {
			return;
		}

		/* we stay on the current page */
		if (event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		/* prevent to duplicate event */
		if ( heatmap.active() ) {
			var url = $(this).attr('href');

			heatmap.stop(true);
			/* go to URL after sending data */
			heatmap.options.clickStorage.send(true, function() {
				goToURL(url);
			});
		}

		/* drop event */
		event.preventDefault();
	});
	/* bind to elements with local links */
	$('a[href^="/"]').bind('click', function(event){
		if (!event) {
			event = window.event
		}

		/* Fix for Chrome when middle button is pressed */
		if (event.which === 2) {
			return;
		}

		/* we stay on the current page */
		if (event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}

		/* prevent to duplicate event */
		if ( heatmap.active() ) {
			heatmap.stop(true);
		}
		else {
			/* drop event */
			event.preventDefault();
		}
	});
} catch(e) {
	console.log(e);
}

});
