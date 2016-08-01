/* global Backbone, _ */

define([
	'dispatcher',
	'core',
	'js/view/GL',
	'text!js/tpl/UserWidget.html',
	'text!js/tpl/GuestWidget.html',
	'text!js/tpl/AuthForm.html',
	'text!js/tpl/Modal.html'
], function (Dispatcher, Core, GL, tplUserWidget, tplGuestWidget, tplAuthForm, tplModal) {
	/**
	 * Виджет пользователя
	 * @module User
	 * 
	 * @requires Dispatcher
	 * @requires Core
	 * @requires GL
	 */
	var UserWidget = Backbone.View.extend({
		el: '.js-user-widget',
		/**
		 * События
		 */
		events: {
//			"click .js-user-login": "onClickLogin"
		},
		_$el: {
			front: $('.front')
		},
		/**
		 * Инициализация
		 */
		initialize: function () {
			//Dispatcher.on( 'User:renderPlace', this.renderPlace, this );
//			this.render();
		},
		render: function () {
			var self = this;

			if (GL.get('profile') === 'user') {
				self.$el.html(_.template(tplUserWidget)({data: GL.get('user')}));
				$('.ui.dropdown').dropdown();
			} else {
				self.$el.html(_.template(tplGuestWidget)());
			}

			return this;
		}
	});
	return UserWidget;
});