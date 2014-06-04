var phantom = require('phantom'),
    Deferred = require("deferred");

var obj = {

    getPhantom: function () {
        var def = Deferred();
        phantom.create(function (ph) {
            def.resolve(ph);
            obj.ph = ph;
        });
        return def.promise;
    },

    getPage: function () {
        var def = Deferred();

        if (!this.ph) {
            this.getPhantom().then(function (ph) {
                obj.getPage().then(function (page) {
                    def.resolve(page);
                });
            });
            return def.promise;
        }
        this.ph.createPage(function (page) {
            def.resolve(page);
        });
        return def.promise;
    }
};

module.exports = obj;