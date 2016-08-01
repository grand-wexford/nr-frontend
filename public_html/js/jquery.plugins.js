if ( typeof String.prototype.trim !== 'function' ) {
	String.prototype.trim = function () {
		return this.replace( /^\s+|\s+$/g, '' );
	};
}

if ( typeof Array.isArray === 'undefined' ) {
	Array.isArray = function ( obj ) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	};
}

jQuery.fn.slidePage = function ( direction, side, callback ) {
	var s = !side || side === 'right' ? '' : '-';
	callback = callback || function(){};
	if ( direction === 'show' ) {
		this.css( {'left': s + this.outerWidth() + 'px'} ).show().animate( {left: 0}, 200 );
	} else {
		this.animate( {'left': s + this.outerWidth() + 'px'}, 200, 'linear', function () {
			$( this ).hide();
			callback();
		} );
	}
};