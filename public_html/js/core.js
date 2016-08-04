/* global _ */

define([
	'jquery',
	'backbone',
	'js/view/GL',
	'js/view/Profiles'
], function ($, Backbone, GL, Profiles) {
	return (function () {
		/**
		 * Глобальный функционал
		 * @module Core
		 * 
		 * @requires $
		 * @requires Dispatcher
		 * @requires GL
		 * @requires Profiles
		 */
		var
				Core = {},
				_XHR = false,
				_debugOn = true,
				_lsOn = true,
				_appCache = false,
				_lsSupported = (function () {
					if (_lsOn && window.localStorage) { 
						return true;
					}
					return false;
				}()),
				_templateCallbacks = {},
				_templateCache = {},
				_templatePrefix = 'tmpl_',
				_version = 0.1,
				_getTemplate = function (url, callback) {
					var cache = Core.lsGet(_templatePrefix + url);

					callback = callback || function () {};

					if (cache) {
						cache = window.JSON.parse(cache);
					}

					if (cache && cache.version === _version) {
						callback(cache.template);
						return;
					}

					if (_templateCallbacks[url]) {
						_templateCallbacks[url].push(callback);
						return;
					}

					_templateCallbacks[url] = [callback];

					$.ajax({
						url: url,
						type: 'GET',
						cache: false,
						async: true,
						success: function (data) {
							Core.lsSet(_templatePrefix + url, window.JSON.stringify({version: _version, template: data}));
							_.each(_templateCallbacks[url], function (cb) {
								cb(data);
							});

							delete _templateCallbacks[url];
						},
						error: function () {
							Core.log('Could not load template ' + url);
						}
					});
				};


		Core = {
			/**
			 * Устанавливает настройки пользователю, в зависимости от его профиля
			 */
			buildProfileSettings: function () {
				var self = this;
				$.each(Profiles[ GL.get('profile') ], function (k, v) {
					self._setSetting(k, v);
				});
			},
			/**
			 * Установить параметр настройки
			 * @param {String} param Параметр
			 * @param {String} value Значение
			 */
			_setSetting: function (param, value) {
				GL.set(['settings', param], value);
			},
			/**
			 * Обёртка для запросов на сервер
			 * @param {Object} params
			 * @returns {Boolean}
			 */
			request: function (params) {
				var self = this;

				if (!params['data']) {
					params['data'] = {};
				}
				if (!params['url']) {
					params['url'] = '';
				}

				$.ajax({
					url: this.getAPIServer() + params.url,
					type: 'POST',
					dataType: "json",
					data: params['data'],
//					xhrFields: {withCredentials: true},
					context: params.self || this,
					error: function (jqXHR, status, error) {
						if (params.checkErrors !== false) {
							self.onAjaxError(jqXHR, status, error, params);
						}
					},
					beforeSend: self.beforeAjaxSend,
					success: function (data) {
						if (data.success !== true) {
							self.onRequestError(data);
						}
						if (params.callback) {
							params.callback(data, params.event, params.self);
						}
					}
				});

				return true;
			},
			/**
			 * При получении ошибки с сервера
			 * @param {String} data Ответ сервера
			 */
			onRequestError: function (data) {
				if (Array.isArray(data.errors)) {
					data.errors.filter(function (value) {
						console.log(value);
					});
				}
			},
			/**
			 * При ошибке ajax запроса
			 * @todo Пока неясно что требуется, пока просто выводи в консоль
			 */
			onAjaxError: function (jqXHR, status, error, params) {
				params = params || false;

				if (status === "abort") { // Если сами прервали, значит не ошибка
					return;
				}

				var message = "Ответ: \n" + jqXHR.responseText + "\n------------------------------\n Статус: \n" + status + "\n------------------------------\n Ошибка: \n" + error + "\n------------------------------\n";

				if (params !== false) {
					message += "\n\n\n Параметры:\n";
					message += "\n\n\n--URL:\n";
					message += params['url'];
					message += "\n\n\n--Запрос:\n";
					message += this.strObj(params['data'], "", 6);
				}
				Core.log('Не удалось получить данные. Возможно сеть недоступна.');
				Core.log(message);

				// например, можно отправить сообщение с ошикой разработчику
				//this.sendError(message);
			},
			/**
			 * Отменяем запрос, если он неудачный
			 * @param {Object} xhr
			 */
			beforeAjaxSend: function (xhr) {
				if (_XHR && this.readystate !== 4) {
					_XHR.abort();
				}
				_XHR = xhr;
			},
			/**
			 * Кладёт данные в localStorage
			 * @description Позволяет хранить массив
			 * @param {String} key Ключ
			 * @param {String|Array} value Значение
			 */
			setStorageObject: function (key, value) {
				window.localStorage.setItem(key, JSON.stringify(value));
			},
			/**
			 * Достаёт данные из localStorage
			 * @description Хранящийся json преобразует в массив
			 * @param {String} key Ключ
			 */
			getStorageObject: function (key) {
				var value = window.localStorage.getItem(key);
				return value && JSON.parse(value);
			},
			/**
			 * Удаляет из массива одинаковые значения
			 * @param {Array} a Массив
			 * @returns {Array}
			 */
			uniq: function (a) {
				var seen = {};
				return a.filter(function (item) {
					return seen.hasOwnProperty(item) ? false : (seen[item] = true);
				});
			},
			/**
			 * Отчищает от тегов
			 * @param {String} html
			 * @returns {String}
			 */
			strip: function (html) {
				var tmp = document.createElement("DIV");
				tmp.innerHTML = html;
				return tmp.textContent || tmp.innerText || "";
			},
			/**
			 * Выводит ли нажатая на клавиатуре клавиша, что-либо на экран
			 * @param {Number} key Идентификатор клавиши
			 * @returns {Boolean}
			 */
			isPrintableKey: function (key) {
				if (key === 229) { // 229 is the composition keycode for chrome, it is sent when user either hit a key or hit a selection ( https://code.google.com/p/chromium/issues/detail?id=118639 )
					return true;
				}

				if (key === 0 || key === 8 || key === 32 || key === 61 || key === 173 || key === 177 || key === 190 || key === 220 || (key >= 65 && key <= 90) || (key >= 96 && key <= 110) || (key >= 48 && key <= 57)) {
					return true;
				}
				return false;
			},
			/**
			 * Входит ли значение в массив
			 * @param {String} value Проверяемое значение
			 * @param {Array} array Массив
			 * @returns {Boolean}
			 */
			in_array: function (value, array) {
				for (var i = 0; i < array.length; i++) {
					if (value == array[i]) {
						return true;
					}
				}
				return false;
			},
			/**
			 * Является ли массивом
			 * @param {Array|} mixed_var Проверяемое значение
			 * @returns {Boolean}
			 */
			is_array: function (mixed_var) {	// Finds whether a variable is an array
				return (mixed_var instanceof Array);
			},
			/**
			 * Является ли числом
			 * @param {String} n Проверяемое значение
			 * @returns {Boolean}
			 */
			is_numeric: function (n) {
				return !isNaN(parseFloat(n)) && isFinite(n);
			},
			/**
			 * Валидация электронного почтового адреса
			 * @param {String} email E-mail
			 * @param {Boolean} strict Жёсткая проверка (с учётом пробелов по краям значения)
			 * @returns {Boolean}
			 */
			isValidEmail: function (email, strict) {
				if (!strict) {
					email = email.replace(/^\s+|\s+$/g, '');
				}
				return (/^([a-z0-9_\-]+\.)*[a-z0-9_\-]+@([a-z0-9][a-z0-9\-]*[a-z0-9]\.)+[a-z]{2,4}$/i).test(email);
			},
			/**
			 * Является ли клиент мобильником
			 * @returns {Boolean}
			 */
			isMobile: function () {
				return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			},
			/**
			 * Подгрузка css файла
			 * @description Возможно, никогда не понадобится
			 * @param {String} file Путь к css-файлу
			 */
			CSSLoad: function (file) {
				var link = document.createElement("link");
				link.setAttribute("rel", "stylesheet");
				link.setAttribute("type", "text/css");
				link.setAttribute("href", file);
				document.getElementsByTagName("head")[0].appendChild(link);
			},
			/**
			 * Возвращает адрес API-сервера
			 * @returns {String}
			 */
			getAPIServer: function () {
				return 'https://backend.soundstream.media/API/v1.6/';
			},
			/**
			 * Конвертация массива в объект
			 * @param {Array} a
			 * @returns {Object}
			 */
			toObject: function (a) {
				var o = {};
				for (var i = 0; i < a.length; i++) {
					o[a[i]] = '';
				}
				return o;
			},
			/*
			 * Округление числа
			 * @param {String} a Число
			 * @param {String} f Кол-во знаков после запятой
			 * @returns {String}
			 */
			roundNum: function (n, f) {
				f = f || 0;
				var out = (+n).toFixed(f).toString().replace(/^((.*?)\.*0+)$/g, '$2');
				return out === 'NaN' ? '' : out;

			},
			/**
			 * Преобразует Объект в строку
			 * @param {Object} obj
			 * @param {String} prefix
			 * @param {Number} depth
			 * @returns {String}
			 */
			strObj: function (obj, prefix, depth) {
				if (this.objectLength(obj) > 0) {
					var str = "\n";
					var k;
					for (k in obj) {
						if (this.objectLength(obj[k]) > 0) {
							if ('object' !== typeof obj[k]) {
								str += prefix + " " + k + ":" + obj[k] + "\n";
							} else {
								str += prefix + " " + k + ": []\n";
							}
							if (obj[k] && 'object' === typeof obj[k] && prefix.length < depth - 1) {
								str += this.strObj(obj[k], prefix + "-", depth);
							}
						}
					}
					return str;
				}
			},
			/**
			 * Размер объекта
			 * @param {Object} obj
			 * @returns {Number|Boolean}
			 */
			objectLength: function (obj) {
				if (obj === null || ((typeof obj !== 'function') && (typeof obj !== 'object'))) {
					return false;
				}

				var size = 0, key;
				for (key in obj) {
					if (obj.hasOwnProperty(key)) {
						size++;
					}
				}
				return size;
			},
			/**
			 * Позволяет писать только число
			 * @param {event} event Событие ожадается из поля ввода, в котором необходимо произвести корректировку
			 */
			correctDigitInput: function (event) {
				$(event.currentTarget).val(this.correctDigit($(event.currentTarget).val()));
			},
			/**
			 * Корректирует значение, в котором допускается только число
			 * @example "1,44,6K = 1.446" 
			 * @param {String} digi
			 * @returns {String}
			 */
			correctDigit: function (digi) {
				if (!digi) {
					return '';
				}

				var value = digi.toString();
				var newValue = value;
				var dots;

				newValue = newValue.replace(/[\,]/g, ".");
				newValue = newValue.replace(/[^\d\.]/g, "");
				dots = newValue.match(/\./g) ? newValue.match(/\./g).length : false;

				if (dots > 1) {
					newValue = newValue.substr(0, newValue.lastIndexOf("."));
				}

				return newValue;
			},
			/**
			 * Возвращает параметры URL
			 * @returns {unresolved}
			 */
			getUrlParams: function () {
				var URLParams = $.parseParams(window.location.search);
				return URLParams;
			},
			/**
			 * Вывод в консоль
			 * @param {*} data
			 */
			log: function (data) {
				if (_debugOn && window.console) {
					if (window.console.log) {
						window.console.log(data);
					}
				}
			},
			template: function (url, callback, context) {
				callback = callback || function () {};
				context = context || this;

				_getTemplate(url, function (data) {
					var template = _.template(data);
					callback.call(context, template);
				});
			},
			templates: function (urls, callback, context) {
				var all = _.keys(urls).length,
						count = 0,
						getTmpl,
						key,
						templates = {};

				callback = callback || function () {};
				context = context || this;

				getTmpl = function (key, url) {
					_getTemplate(url, function (data) {
						count += 1;
						templates[key] = _.template(data);
						if (all === count) {
							callback.call(context, templates);
						}
					});
				};

				for (key in urls) {
					if (urls.hasOwnProperty(key)) {
						getTmpl(key, urls[key]);
					}
				}
			},
			lsGet: function (key) {
				if (!_lsSupported && !_appCache) {
					return;
				}

				try {
					return _appCache ? _templateCache[key] : window.localStorage.getItem(key);
				} catch (event) {
					Core.log(event);
				}
			},
			lsSet: function (key, value) {
				if (!_lsSupported && !_appCache) {
					return;
				}

				try {
					_appCache ? _templateCache[key] = value : window.localStorage.setItem(key, value);
				} catch (event) {
					Core.log(event);
				}
			}};
		
		/**
		 * Изменяем обработку шаблонов
		 */
		Core.View = Backbone.View.extend({
			_templateBind: false,
			_templateUrl: undefined,
			loadTemplate: function () {
				if (!this._templateUrl) {
					return;
				}

				if (_.isObject(this._templateUrl)) {
					Core.templates(this._templateUrl, function (templates) {
						this._template = templates;
						this.trigger('templateReady');
					}, this);
				} else if (_.isString(this._templateUrl)) {
					Core.template(this._templateUrl, function (template) {
						this._template = template;
						this.trigger('templateReady');
					}, this);
				}
			},
			render: function () {
				if (!this._templateBind && this._templateUrl && !this._template) {
					this.on('templateReady', this.render, this);
					this._templateBind = true;
					return this;
				}
				return this._render.apply(this, arguments);
			},
			_render: function () {
				return this;
			},
			remove: function () {
				this.trigger('beforeDestroyView');
				Backbone.View.prototype.remove.apply(this);
			}
		});

		return Core;
	}());
});