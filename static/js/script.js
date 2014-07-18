define(
    [
        "highlight",
        "adriver"
    ],
    function (

        Hightlight,
        adriver

        ) {
        app = new Backbone.Marionette.Application();

        app.module("Layout", function (Layout, App, Backbone) {

            Layout.ControlView = Backbone.Marionette.ItemView.extend({

                template: "#controlTemplate",

                ui: {
                    formUrl: ".Url-Form",
                    inputUrl: ".Url-Input",
                    buttonUrl: ".Url-Button",
                    buttonChoose: ".Banner-Choose",
                    inputPath: ".Banner-Path",
                    inputFile: ".Banner-File",
                    buttonUpload: ".Banner-Upload",
                    buttonPath: ".Banner-Button",
                    formFile: ".Banner-Form",
                    buttonSave: ".Banner-Save"
                },

                events: {
                    "click @ui.buttonUrl": "submitUrl",
                    "click @ui.buttonChoose": "choose",
                    "click @ui.buttonUpload": "upload",
                    "click @ui.buttonPath": "insert",
                    "submit @ui.formFile": "submit",
                    "click @ui.buttonSave": "save"
                },

                modelEvents: {
                    "sync": "onsync"
                },

                choose: function (e) {
                    e.preventDefault();
                    app.execute("iframe:choose");
                },

                submit: function (e) {
                    e.preventDefault();

                },

                upload: function (e) {
                    e.preventDefault();
                    var formData = new FormData(),
                        files = this.ui.inputFile[0].files;
                    for (var i = 0, file; file = files[i]; ++i) {
                        formData.append(file.name, file);
                    }
                    this.model.get("uuid") && formData.append("uuid", this.model.get("uuid"));

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', '/files', true);
                    xhr.onload = function(e) {
                        this.model.set("uuid", JSON.parse(e.currentTarget.responseText).uuid);
                    }.bind(this);

                    xhr.send(formData);
                },

                insert: function (e) {
                    e.preventDefault();
                    var elem = this.model.get("dom");
                    if (!elem) return;
                    this.model.set("server", this.ui.inputPath.val());
                    App.trigger("banner:insert", {
                        node: elem,
                        server: 'http://localhost:8081/files/' + this.model.get('uuid') + '/'
                    });
                    this.model.set("placeholderID", elem.childNodes[0].id);
                },

                getContent: function (e) {
                    var content = App.request('content');
                },

                onsync: function (e) {},

                save: function (e) {
                    e.preventDefault();
                    App.execute("save");
                },

                submitUrl: function (e) {
                    e.preventDefault();
                    var url = this.ui.inputUrl.val();
                    if (!/^http(s)?:\/\//i.test(url)) {
                        url = 'http://' + url;
                        this.ui.inputUrl.val(url);
                    }
                    this.model.set("url", url);
                    app.vent.trigger("iframe:destroy");
                    app.vent.trigger("change:url", {
                        value: this.model.get("url")
                    });
                }

            });

            Layout.IframeView = Backbone.Marionette.ItemView.extend({

                template: "#IframeTemplate",

                ui: {
                    iframe: "#content"
                },

                events: {
                    "load:after @ui.iframe": "load"
                },

                modelEvents: {
                    "change:url": "setUrl"
                },

                initialize: function () {

                    App.reqres.setHandler("content", this.content.bind(this));

                },

                matchHeight: function () {
                    var interfaceHeight = $("#control").height();
                    this.ui.iframe.height(
                        interfaceHeight + $(this.ui.iframe[0].contentDocument).height()
                    );
                },

                load: function (e) {
                    this.matchHeight();
                },

                setUrl: function () {
                    this.ui.iframe.attr('src', "/url?q=" + this.model.get("url"));
                    this.ui.iframe.height(300);
                },

                onShow: function () {

                    var _this = this;
                    this.ui.iframe[0].onload = function () {
                        _this.inject.call(this.contentWindow);
                    }
                    this.listenTo(App, "banner:insert", function () {
                        setTimeout(this.matchHeight.bind(this), 5000);
                    }.bind(this));
                },

                content: function () {

                    var node = this.ui.iframe[0].contentDocument.doctype,
                        docHTML = "<!DOCTYPE "
                            + node.name
                            + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                            + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                            + (node.systemId ? ' "' + node.systemId + '"' : '')
                            + '>',
                        doc = this.ui.iframe.contents().find("html"),
                        ph = doc.find("#" + this.model.get("placeholderID")),
                        script = ph.siblings("script"),
                        scriptHTML = script.html(),
                        newScript = $('<script type="text/javascript"></script>');

                    ph.html("");
                    html = doc.prop("outerHTML");
                    script.remove();
                    newScript.html(scriptHTML);
                    ph.parent().append(newScript);
                    return docHTML + html;

                },

                inject: function () {
                    var script = this.document.createElement("script");
                    script.src = "/static/js/inject.js";
                    this.document.querySelector("head").appendChild(script);
                }

            });

        });

        app.module("Inject", function (Inject, App, Backbone) {

            var InnerApp = Backbone.Marionette.View.extend({

                initialize: function (ctx) {
                    this.ctx = ctx;
                    this.parent = ctx.parent;
                    this.app = ctx.parent.app;
                    var highlight = Hightlight(ctx);
                    this.highlight = highlight;

                    this.app.commands.setHandler("iframe:choose", function () {
                        highlight.highlight();
                    });

                    this.listenTo(App, "banner:insert", function (params) {
                        return this.insert(params);
                    }.bind(this));

                    $(highlight).on("choose", function (e, elem) {
                        this.app.vent.trigger("iframe:chosen", elem);
                    }.bind(this));

                    this.listenTo(App.vent, "iframe:destroy", this.destroy);

                },

                resizeIframe: function () {

                },

                insert: function (params) {

                    var node = params.node;
                    var bp = this.ctx.document.createElement('div'), id = 'adriver_banner'+Math.round(Math.random()*100);
                    bp.id = id;
                    node.innerHTML = "";
                    node.appendChild(bp);
                    var script = this.ctx.document.createElement('script');
                    script.innerHTML = adriver(id, params.server);
                    node.appendChild(script);
                    return bp;
                },

                destroy: function () {
                    this.stopListening();
                    this.ctx = this.parent = this.app = this.highlight = null;
                }

            });

            Inject.InnerApp = InnerApp;

        });

        app.module("Controller", function (Controller, App, Backbone) {

            var model = new (Backbone.Model.extend({
                url:"/put"
            }));

            model.listenTo(App.vent, "iframe:chosen", function (elem) {
                model.set("dom", elem);
            });

            model.listenTo(App.vent, "iframe:destroy", function () {
                model.set("dom", null);
            });

            App.commands.setHandler("save", function (data) {

                model
                    .set("content", App.request('content'))
                    .save(
                        _.extend( {}, model.attributes, {dom:null})
                    );
            });

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

        return app;
});