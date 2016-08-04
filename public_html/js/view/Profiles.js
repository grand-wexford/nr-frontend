define( [], function ( ) {

	/**
	 * Описание профилей
	 * @description Задел на будущее. Тут можно хранить настройки различных профилей (например, гость, пользователь, модератор)
	 * @module Profiles
	 */

	return {
		/**
		 * 
		 * @property {string} level - Уровень доступа
		 */
		'user': {
			'level': '1'
		},
		'guest': {
			'level': '0'
		}
	};

} );