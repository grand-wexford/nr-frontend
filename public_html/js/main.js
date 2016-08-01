requirejs.config( {
	urlArgs: "bust=" + Math.random(),
	baseUrl: '.',
	waitSeconds: 20,
	deps: ['plugins','semantic'],
	paths: {
		jquery: 'vendors/jquery-2.2.4.min',
		semantic: 'vendors/semantic-ui-2.2.2/semantic.min',
		underscore: 'vendors/underscore-1.8.3.min',
		backbone: 'vendors/backbone-1.3.3.min',
		core: 'js/core',
		dispatcher: 'js/dispatcher',
		plugins: 'js/jquery.plugins',
		text: 'vendors/require.text-2.0.15'
	},
	shim: {
		core: {exports: 'Core', deps: ['jquery']},
		plugins: ['jquery'],
		semantic: ['jquery'],
		dispatcher: ['backbone'],
		backbone: {
			deps: ['underscore'],
			exports: 'Backbone'
		},
		underscore: {
			exports: '_'
		}
	}
} );

var GLOBAL = {};
	requirejs( ["js/app"], function ( App ) {
		window.bTask = new App();
	} );