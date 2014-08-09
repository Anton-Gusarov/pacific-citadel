define([
    "text!adriver.js",
    "text!../adfox/prepareCodeFlash.js",
    "text!../adfox/prepareCodeFullScreen.js",
    "text!../adfox/prepareCodeScreenGlideFLV.js",
    "text!../adfox/prepareCodeScreenGlideFullscreen.js"
], function (
    adriver,
    adfoxFlash,
    adfoxFullscreen,
    adfoxScreenglide,
    adfoxScreenglideFullscreen
) {

    return {
        "adfox.flash": adfoxFlash,
        "adfox.fullscreen": adfoxFullscreen,
        "adfox.screenglide": adfoxScreenglide,
        "adfox.screenglidefullscreen": adfoxScreenglideFullscreen
    }

});