var libPath = '../../bower_components';
requirejs.config({
    baseUrl: 'static/js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        lib: libPath,
        text: libPath + '/requirejs-text/text'
    },
    text: {
        useXhr: function (url, protocol, hostname, port) {
            //Override function for determining if XHR should be used.
            //url: the URL being requested
            //protocol: protocol of page text.js is running on
            //hostname: hostname of page text.js is running on
            //port: port of page text.js is running on
            //Use protocol, hostname, and port to compare against the url
            //being requested.
            //Return true or false. true means "use xhr", false means
            //"fetch the .js version of this resource".
        }
    },
    deps:["text"]
});

// Start the main app logic.
requirejs([
    'script'
],
    function   () {

    });