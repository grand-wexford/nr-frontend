/* global Backbone, _ */

define([
	'dispatcher',
	'core',
	'js/view/GL'
], function (Dispatcher, Core, GL) {
	/**
	 * Виджет пользователя
	 * @module User
	 * 
	 * @requires Dispatcher
	 * @requires Core
	 * @requires GL
	 */
	var UserWidget = Core.View.extend({
		el: '.js-user-widget',
		_templateUrl: {
			userWidget: 'js/tpl/UserWidget.html',
			guestWidget: 'js/tpl/GuestWidget.html'
		},
		initialize: function(){
			this.loadTemplate();
		},
		_render: function () {
			if (GL.get('profile') === 'user') {
				this.$el.html(this._template.userWidget({data: GL.get('user')}));
				$('.js-user-widget-dropdown').dropdown();
			} else {
				this.$el.html(this._template.guestWidget());
			}

			return this;
		}
	});
	return UserWidget;
});