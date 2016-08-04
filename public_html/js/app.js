/* global Backbone */

"use strict";

define( [
	'dispatcher',
	'core',
	'js/view/User',
	'js/view/GL'
], function ( Dispatcher, Core, User, GL ) {
	/**
	 * Главный модуль приложения
	 * @description В основном, должен отвечать за управление другими модулями
	 * @module App
	 * 
	 * @requires Dispatcher
	 * @requires Core
	 * @requires User
	 * @requires GL
	 */

	var App = Core.View.extend( {
		/**
		 * Инициализация приложения.
		 * Подгрузка модулей.
		 */
		initialize: function () {
			new User();
			
			// На самом деле, большого смысла в этом треггере нет, можно было сделать например так:
			// new User().auth();
			// Но пока это единственное место с триггером, так что оставлено для примера.
			Dispatcher.trigger( 'User:auth' );
		}
	} );
	return App;
} );