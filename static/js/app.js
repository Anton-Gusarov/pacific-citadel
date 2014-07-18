requirejs.config({
    baseUrl: 'static/js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: 'bower_components'
    }
});

// Start the main app logic.
requirejs(['script'],
    function   () {
        app.start();
    });