define( [

], function (  ) {

	/**
	 * Модуль для работы с глобальными переменными
	 * @module GL
	 */

	return {
		/**
		 * @property {object} _GL				- Значения глобальных переменных по-умолчанию.
		 * @property {string} _GL.state			- Начальное состояние системы (не используется).
		 * @property {object} _GL.user			- Данные пользователя.
		 * @property {string} _GL.profile		- Используемых профиль (в данный момент только guest|user).
		 * @property {string} _GL.access_token	- Токен с сервера, после получения храниться в localstorage.
		 * @property {string} _GL.access_id		- Id пользователя, после получения храниться в localstorage.
		 */

		_GL: {
			'state': '',
			'user': {},
			'profile': 'guest',
			'access_token': localStorage.getItem("access_token"),
			'access_id': localStorage.getItem("access_id"),
		},

		/*
		 * Возвращает значение глобальной переменной.
		 * @param {string|array} key Ключ переменной.
		 * @return {string} Значение переменной.
		 */
		get: function ( key ) {
			var GlVar = '';
			var getVar = '';
			var self = this; // Do not remove. Это нужно, хотя IDE может пометить как неиспользуемое.
			var isExists = true;

			if ( Array.isArray( key ) ) {
				$.each( key, function ( k, v ) {
					GlVar = GlVar + '[\'' + v + '\']';
					
					if ( !eval( 'self._GL' + GlVar ) ) {
						isExists = false;
						return false;
					}
				} );
				
				if ( !isExists ) {
					getVar = undefined;
				} else {
					getVar = eval( 'this._GL' + GlVar );
				}
			} else {
				getVar = this._GL[key];
			}
			
			return getVar;
		},

		/*
		 * Устанавливает значение глобальной переменной.
		 * @param {string|array} key Ключ переменной.
		 * @param {string} value Новое значение переменной.
		 */
		set: function ( key, value ) {
			var GlVar = '';
			var self = this; // Do not remove. Это нужно, хотя IDE может пометить как неиспользуемое.
			var i = 0;
			if ( Array.isArray( key ) ) {
				$.each( key, function ( k, v ) {
					i++;
					GlVar = GlVar + '[\'' + v + '\']';

					if ( !eval( 'self._GL' + GlVar ) && key.length > i ) {
						eval( 'self._GL' + GlVar + ' = []' );
					}
				} );
				eval( 'this._GL' + GlVar + ' = ' + JSON.stringify( value ) );
			} else {
				this._GL[key] = value;
			}
		},
		/*
		 * Удаляет значение глобальной переменной.
		 * @param {string|array} key ключ переменной.
		 */
		del: function ( key ) {
			var GlVar = '',
					self = this,
					GlVarPre = '',
					arrPre = [],
					lastV,
					i = 0,
					pre,
					newR;

			if ( Array.isArray( key ) ) {
				$.each( key, function ( k, v ) {
					i++;

					GlVar = GlVar + '[\'' + v + '\']';
					if ( key.length > i ) {
						GlVarPre = GlVarPre + '[\'' + v + '\']';
						arrPre.push( v );
					}
					lastV = v;
				} );

				if ( self._isNumeric( lastV ) ) {
					newR = [];
				} else {
					newR = {};
				}

				pre = eval( 'this._GL' + GlVarPre );

				if ( typeof pre !== 'undefined' ) {
					$.each( pre, function ( k, v ) {
						if ( k !== lastV ) {
							if ( Array.isArray( newR ) ) {
								newR.push( v );
							} else {
								newR[k] = pre[k];
							}
						}
					} );

					this.set( arrPre, newR );
				}
			} else {
				if ( self._isNumeric( key ) ) {
					newR = [];
				} else {
					newR = {};
				}

				$.each( this._GL, function ( k, v ) {
					if ( k !== key ) {
						if ( Array.isArray( newR ) ) {
							newR.push( v );
						} else {
							newR[k] = v;
						}
					}
				} );

				this._GL = newR;
			}
		},

		// не в Core т.к. он сюда не подключается
		_isNumeric: function ( n ) {
			return !isNaN( parseFloat( n ) ) && isFinite( n );
		}
	};
} );