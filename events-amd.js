define('event', [], function() {
	var touchEventPrefix = !!window.MSInputMethodContext ? '' : 'MS';
	var ie = {
		'msPointerEnabled' : function() {
			return window.navigator.msPointerEnabled || window.PointerEvent;
		},
		'event' : {
			'touchstart' : touchEventPrefix + 'PointerDown',
			'touchmove' : touchEventPrefix + 'PointerMove',
			'touchend' : touchEventPrefix + 'PointerOut'
		}
	}

	function addEvent(el, eventName, command, named) {
		var named = named || 'undefined';
		el['_event'] = el['_event'] || {};
		el['_event'][eventName] = el['_event'][eventName] || {};
		el['_event'][eventName][named] = el['_event'][eventName][named] || [];
		el['_event'][eventName][named].push(command);
	}

	function removeEvent(el, eventName, named) {
		if (el['_event']) {
			if (named) {
				el['_event'][eventName][named] = [];
			} else {
				el['_event'][eventName] = {};
			}
		}
	}

	function eventsCommandsFor(el, eventName, named) {
		if (named) {
			return el['_event'][eventName][named];
		}
		var commands = [];
		if (el['_event']) {
			for (key in el['_event'][eventName]) {
				commands = commands.concat(el['_event'][eventName][key]);
			}
		}
		return commands;
	}

	function validEventName(eventName) {
		if (ie.msPointerEnabled() && ie.event[eventName]) {
			eventName = ie.event[eventName];
		}
		return eventName;
	}

	return {
		addEvent : function(el, eventName, command, named) {
			eventName = validEventName(eventName);
			if (el.addEventListener) {
				el.addEventListener(eventName, command);
				addEvent(el, eventName, command, named);
			} else {
				var newCommand = function() {
					return command.apply(el, arguments);
				};
				el.attachEvent("on" + eventName, newCommand);
				addEvent(el, eventName, newCommand, named);
			}
		},
		removeEvent : function(el, eventName, named) {
			eventName = validEventName(eventName);
			var commands = eventsCommandsFor(el, eventName, named);
			for (var i = 0; i < commands.length; i++) {
				if (el.removeEventListener) {
					el.removeEventListener(eventName, commands[i]);
				} else {
					el.detachEvent('on' + eventName, commands[i]);
				}
			}
			removeEvent(el, eventName, named);
		}
	}
});
