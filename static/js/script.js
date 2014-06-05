/* Author: YOUR NAME HERE
*/

app = new Backbone.Marionette.Application();

app.module("Layout", function (Layout, App, Backbone) {

    Layout.ControlView = Backbone.Marionette.View.extend({

        template: "#controlTemplate",

        ui: {
            formUrl: ".Url-Form",
            inputUrl: ".Url-Input",
            buttonUrl: ".Url-Button"
        },

        events: {
            "click @ui.buttonUrl": "submitUrl"
        },

        submitUrl: function (e) {
            e.preventDefault();
            this.model.set("url", this.ui.inputUrl.val());
            app.vent.trigger("change:url", {
                value: this.model.get("url")
            });
        }

    });

    Layout.IframeView = Backbone.Marionette.View.extend({

        ui: {
            iframe: "#content"
        },

        modelEvents: {
            "change:url": "setUrl"
        },

        setUrl: function () {
            this.ui.iframe.attr('src', this.model.get("url"));
        }

    });

});

app.module("Controller", function (Controller, App, Backbone) {

    var model = new Backbone.Model();

    Controller.addInitializer(function () {

        var control = new app.Layout.ControlView({
            model: model
        });
        app.controlRegion.show(control);

        var iframe = new app.Layout.IframeView({
            model: model
        });
        app.iframeRegion.show(iframe);
    });

});

app.addRegions({
    "controlRegion": "#control",
    "iframeRegion": ".Iframe"
});


    /*var socket = io.connect();

    $('#sender').bind('click', function() {
     socket.emit('message', 'Message Sent on ' + new Date());
    });

    socket.on('server_message', function(data){
     $('#receiver').append('<li>' + data + '</li>');
    });*/

//    app.start();
