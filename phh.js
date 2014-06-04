var phantom = require('phantom');

phantom.create(function (ph) {
    ph.createPage(function (page) {
        page.open("http://www.google.com", function (status) {
            console.log("opened google? ", status);
            page.get("content", function (value) {
                console.log('Page title is ' + value);
                ph.exit();
            });
        });
    });
});