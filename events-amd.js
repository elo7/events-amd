define('event', [], function() {
	function addEvent(el, eventName, command, named) {
		var named = named || 'undefined';
		el['_event'] = el['_event'] || {};
		el['_event'][eventName] = el['_event'][eventName] || {};
		el['_event'][eventName][named] = el['_event'][eventName][named] || [];
		el['_event'][eventName][named].push(command);
	}

	function removeEvent(el, eventName, named) {
		if (el['_event']) {
			if (named && el['_event'][eventName]) {
				el['_event'][eventName][named] = [];
				delete el['_event'][eventName][named];
			} else {
				el['_event'][eventName] = {};
			}
		}
	}

	function eventsCommandsFor(el, eventName, named) {
		if (named) {
			if (el['_event'] && el['_event'][eventName]) {
				return el['_event'][eventName][named] || [];
			}
			return [];
		}
		var commands = [];
		if (el['_event']) {
			for (key in el['_event'][eventName]) {
				commands = commands.concat(el['_event'][eventName][key]);
			}
		}
		return commands;
	}

	function supportsPassive() {
		var supportsPassive = false;
		try {
			var opts = Object.defineProperty({}, 'passive', {
				get: function() {
					supportsPassive = true;
				}
			});
			window.addEventListener("testPassive", null, opts);
			window.removeEventListener("testPassive", null, opts);
		} catch (e) {}

		return supportsPassive;
	}

	return {
		addEvent : function(el, eventName, command, namedOrConfigs) {
			var named;
			if (typeof namedOrConfigs === 'string') {
				named = namedOrConfigs;
			} else if (typeof namedOrConfigs === 'object') {
				named = namedOrConfigs.named;
			}

			if (el.addEventListener) {
				if (typeof namedOrConfigs === 'object'){
					if(namedOrConfigs.passive && !supportsPassive()) {
						delete namedOrConfigs.passive;
					}
					el.addEventListener(eventName, command, namedOrConfigs);
				} else {
					el.addEventListener(eventName, command);
				}
				addEvent(el, eventName, command, named);
			} else {
				var newCommand = function() {
					return command.apply(el, arguments);
				};
				el.attachEvent('on' + eventName, newCommand);
				addEvent(el, eventName, newCommand, named);
			}
		},
		removeEvent : function(el, eventName, named) {
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
