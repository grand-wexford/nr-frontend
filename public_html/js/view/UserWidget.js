/* global Backbone, _ */

define([
	'dispatcher',
	'core',
	'js/view/GL',
	'text!js/tpl/UserWidget.html',
	'text!js/tpl/GuestWidget.html'
], function (Dispatcher, Core, GL, tplUserWidget, tplGuestWidget) {
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
		render: function () {
			if (GL.get('profile') === 'user') {
				this.$el.html(_.template(tplUserWidget)({data: GL.get('user')}));
				$('.ui.dropdown').dropdown({
					transition: 'scale'
				});
			} else {
				this.$el.html(_.template(tplGuestWidget)());
			}

			return this;
		}
	});
	return UserWidget;
});