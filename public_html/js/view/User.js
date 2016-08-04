/* global Backbone, _, grecaptcha */

define([
	'dispatcher',
	'core',
	'js/view/GL',
	'js/view/UserWidget'
], function (Dispatcher, Core, GL, UserWidget) {
	/**
	 * Пользователь
	 * @module User
	 * 
	 * @requires Dispatcher
	 * @requires Core
	 * @requires GL
	 */
	var User = Core.View.extend({
		el: 'body',
		_templateUrl: {
			authForm: 'js/tpl/AuthForm.html',
			registrationForm: 'js/tpl/RegistrationForm.html',
			recoverForm: 'js/tpl/RecoverForm.html',
			modal: 'js/tpl/Modal.html'
		},
		/**
		 * События
		 */
		events: {
			"click .js-user-login": "_onClickLogin",
			"click .js-user-logout": "_onClickLogout",
			"click .js-user-registration": "_onClickRegistration",
			"click .js-user-recover": "_onClickRecover",
			"click .js-login-social button": "_onClickSocialLoginButton"
		},
		/**
		 * Инициализация
		 */
		initialize: function () {
			Dispatcher.on( 'User:auth', this.auth, this );
			
			this.loadTemplate();

			this.UserWidget = new UserWidget();
			this.render();
		},
		/**
		 * Авторизация
		 * @description Пытаемся опознать пользователя
		 */
		auth: function () {
			if (GL.get('access_token') && GL.get('access_id')) {
				this._getUserData();
			} else {
				this.UserWidget.render();
			}
		},
		/**
		 * Получаем с сервера информацию о пользователе по токену
		 * @param {event} event
		 */
		_onClickSocialLoginButton: function (event) {
			if ($(event.currentTarget).hasClass('facebook')) {
				window.open('https://www.facebook.com/dialog/oauth?client_id=953736151309590&redirect_uri=https://soundstream.media/facebook&response_type=token&scope=email', '', 'width=600,height=450');
			} else if ($(event.currentTarget).hasClass('twitter')) {
				console.log('twitter');
			} else if ($(event.currentTarget).hasClass('odnoklassniki')) {
				console.log('odnoklassniki');
			} else if ($(event.currentTarget).hasClass('vk')) {
				window.open('http://oauth.vk.com/authorize?client_id=4604288&scope=offline&display=popup&redirect_uri=https://soundstream.media/vk&response_type=token', '', 'width=500,height=400');
			}
		},
		
		_getUserData: function () {
			var self = this;
			Core.request({
				data: {
					action: 'me',
					access_token: GL.get('access_token'),
					access_id: GL.get('access_id')
				},
				callback: function (data) {
					if (data.success === true) {
						GL.set('profile', 'user');
						GL.set('user', data.data[0]);
					} else {
						localStorage.removeItem("access_token");
						localStorage.removeItem("access_id");

						GL.del('access_token');
						GL.del('access_id');
					}
					// При любом ответе отображаем виджет
					// @todo Не очень хорошо, что это здесь. Логически не вписывается.
					this.UserWidget.render();
				}
			});
		},
		/**
		 * При успешном прохождении валидации формы входа
		 * @param {Event} event
		 * @param {Object} fields Данные формы
		 * @returns {Boolean} false Чтобы не сабмитнуло форму стандартными средствами браузера
		 */
		_onFormLoginSuccess: function (event, fields) {
			Core.request({
				data: {
					action: 'register_client',
					type: 'native',
					is_signup: 0,
					email: fields.email,
					password: fields.password
				},
				callback: function (data) {
					if (data.success === true) {
						localStorage.setItem("access_token", data.data[0]['access_token']);
						localStorage.setItem("access_id", data.data[0]['id']);
						// Перегружаем страницу полностью. Возможно, в дальнейшем можно попробовать перерендерить куски зависящие от авторизации.
						window.location.reload();
					} else {
						if (Array.isArray(data.errors) && data.errors.length > 0) {
							var $ul = $('.js-error-message').removeClass('hidden').find('ul').text('');
							data.errors.forEach(function (v) {
								$liError = $('<li>').html(v.message);
								$ul.append($liError);
							});
						}
					}
				}
			});

			return false;
		},
		/**
		 * При успешном прохождении валидации формы регистрации
		 * @param {Event} event
		 * @param {Object} fields Данные формы
		 * @returns {Boolean} false Чтобы не сабмитнуло форму стандартными средствами браузера
		 */
		_onFormRegistrationSuccess: function (event, fields) {
			Core.request({
				data: {
					action: 'register_client',
					type: 'native',
					is_signup: 1,
					name: fields.name,
					email: fields.email,
					password: fields.password1
				},
				callback: function (data) {
					if (data.success === true) {
						localStorage.setItem("access_token", data.data[0]['access_token']);
						localStorage.setItem("access_id", data.data[0]['id']);
						// Перегружаем страницу полностью. Возможно, в дальнейшем можно попробовать перерендерить куски зависящие от авторизации.
						window.location.reload();
					} else {
						if (Array.isArray(data.errors) && data.errors.length > 0) {
							var $ul = $('.js-error-message').removeClass('hidden').find('ul').text('');
							data.errors.forEach(function (v) {
								$liError = $('<li>').html(v.message);
								$ul.append($liError);
							});
						}
					}
				}
			});

			return false;
		},
		
		/**
		 * При успешном прохождении валидации формы восстановления пароля
		 * @param {Event} event
		 * @param {Object} fields Данные формы
		 * @returns {Boolean} false Чтобы не сабмитнуло форму стандартными средствами браузера
		 */
		_onFormRecoverSuccess: function (event, fields) {
			Core.request({
				data: {
					action: 'recover',
					email: fields.email,
					'g-recaptcha-response': '' //@todo доработать каптчу
				},
				callback: function (data) {
					if (data.success === true) {
						// @todo выдать сообщение, что данные отправлены на почту

					} else {
						if (Array.isArray(data.errors) && data.errors.length > 0) {
							var $ul = $('.js-error-message').removeClass('hidden').find('ul').text('');
							data.errors.forEach(function (v) {
								$liError = $('<li>').html(v.message);
								$ul.append($liError);
							});
						}
					}
				}
			});

			return false;
		},
		
		/**
		 * Выход пользователя
		 */
		_onClickLogout: function () {
			localStorage.removeItem("access_token");
			localStorage.removeItem("access_id");

			// Перегружаем страницу полностью. Возможно, в дальнейшем можно попробовать перерендерить куски зависящие от авторизации.
			window.location.reload();
		},
		
		/**
		 * При клике на кнопку "Создать аккаунт"
		 */
		_onClickRegistration: function () {
			// запускаем модальное окно
			$('.ui.modal.js-registration-modal').modal({
				duration: 300,
				autofocus: false,
				transition: 'fade down'
			}).modal('show');

			// Сюда собираются ошибки сервера. Прячем слой, т.к. он мог быть отображён при прошлом входе.
			$('.js-error-message').not(':has(.hidden)').addClass('hidden');

			// сбрасываем форму (она может быть заполнена с прошлого раза), и вносим данные для валидации
			$('.ui.js-registration-form')
					.form('reset')
					.form({
						inline: true,
						on: 'blur',
						onSuccess: this._onFormRegistrationSuccess,
						fields: {
							name: {
								identifier: 'name',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите Имя'
									}
								]
							},
							email: {
								identifier: 'email',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите E-mail'
									},
									{
										type: 'email',
										prompt: 'Пожалуйста, введите корректный E-mail'
									}
								]
							},
							// Называть это поле "password" нельзя, валидация будет работать некорректно в semantic-ui
							password1: {
								identifier: 'password1',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите пароль'
									}
								]
							},
							password2: {
								identifier: 'password2',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите подтверждение пароля'
									},
									{
										type: 'match[password1]',
										prompt: 'Введённые пароли должны совпадать'
									}
								]
							}
						}
					});
		},
		
		/**
		 * Callback для каптчи.
		 * @description Пока каптча не работает - не понятно что тут должно быть
		 * @returns {undefined}
		 */
		_verifyCaptchaCallback: function () {

		},
		
		/**
		 * При клике на кнопку "Забыли пароль?"
		 */
		_onClickRecover: function () {
			// Запускаем модальное окно
			$('.ui.modal.js-recover-modal').modal({
				duration: 300,
				transition: 'fade down'
			}).modal('show');

			// Сюда собираются ошибки сервера. Прячем слой, т.к. он мог быть отображён при прошлом входе.
			$('.js-error-message').not(':has(.hidden)').addClass('hidden');

			// Рисуем каптчу
			// @todo sitekey сейчас с soundstream.media , надо менять на нерадио
			if ($('#reCaptcha').is(':empty')) {
				grecaptcha.render('reCaptcha', {
					'sitekey': '6Lc76gsTAAAAAD3X7MMGSbZDt5nnex1ao1De4tiA',
					'callback': this._verifyCaptchaCallback,
					'theme': 'light'
				});
			}

			// Сбрасываем форму (она может быть заполнена с прошлого раза), и вносим данные для валидации
			$('.ui.js-recover-form')
					.form('reset')
					.form({
						inline: true,
						on: 'blur',
						onSuccess: this._onFormRecoverSuccess,
						fields: {
							email: {
								identifier: 'email',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите E-mail'
									},
									{
										type: 'email',
										prompt: 'Пожалуйста, введите корректный E-mail'
									}
								]
							}
						}
					});
		},
		
		/**
		 * При клике на кнопку Вход
		 */
		_onClickLogin: function () {
			// запускаем модальное окно
			$('.js-login-modal').modal({
				duration: 300,
				transition: 'fade down'
			}).modal('show');

			// Сюда собираются ошибки сервера. Прячем слой, т.к. он мог быть отображён при прошлом входе.
			$('.js-error-message').not(':has(.hidden)').addClass('hidden');

			// Сбрасываем форму (она может быть заполнена с прошлого раза), и вносим данные для валидации
			$('.js-login-form')
					.form('reset')
					.form({
						inline: true,
						onSuccess: this._onFormLoginSuccess,
						fields: {
							email: {
								identifier: 'email',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите E-mail'
									},
									{
										type: 'email',
										prompt: 'Пожалуйста, введите корректный E-mail'
									}
								]
							},
							password: {
								identifier: 'password',
								rules: [
									{
										type: 'empty',
										prompt: 'Пожалуйста, введите пароль'
									}
								]
							}
						}
					});
		},
		
		/**
		 * Рендер
		 * @description Добавляем на страницу необходимые модулю элементы
		 * @returns {User_L11.UserAnonym$1}
		 */

		_render: function () {
			this.authModal =  this._template.modal({
				data: {
					title: 'Вход на сайт',
					content: this._template.authForm(),
					jsClass: 'js-login-modal'
				}
			});
			
			this.registrationModal = this._template.modal({
				data: {
					title: 'Регистрация',
					content: this._template.registrationForm(),
					jsClass: 'js-registration-modal'
				}
			});
			this.recoverModal = this._template.modal({
				data: {
					title: 'Регистрация',
					content: this._template.recoverForm(),
					jsClass: 'js-recover-modal'
				}
			});
			this.$el
					.append(this.authModal)
					.append(this.registrationModal)
					.append(this.recoverModal);
			
			//this._onClickRegistration();
			return this;
		}
	});
	return User;
});