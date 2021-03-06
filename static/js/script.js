define(
    [
        "highlight",
        "adriver",
        "resources",
        "codes"
    ],
    function (

        Hightlight,
        adriver,
        Resources,
        codes

        ) {
        app = new Backbone.Marionette.Application();

        function replace(data, str) {
            return result = str.replace(/\{\{(.*?)\}\}/g, function(match, token) {
                return data[token];
            });
        }

        function clone (obj, ignore) {
            var dest = {};
            for (var i in obj) {
                if (!obj.hasOwnProperty(i)) {
                    continue;
                }
                if (_.indexOf(ignore, i) > -1) {
                    continue;
                }
                dest[i] = obj[i];
            }
            return dest;
        }

        Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
            // use Handlebars.js to compile the template
            return Handlebars.compile(rawTemplate);
        }

        var config = {
            isProduction: window.location.toString().indexOf("localhost") === -1,
            isDevelopment: window.location.toString().indexOf("localhost") > -1,
            appUrl: window.location.protocol + '//' + window.location.host + window.location.pathname
        };

        app.module("Layout", function (Layout, App, Backbone) {

            Layout.LoaderView = Backbone.Marionette.View.extend({

                template: $('#loaderTemplate').html(),

                initialize: function () {
                    this.loader = $(this.template);
                    this.loader.hide();
                    this.$el.prepend(this.loader);
                },

                hide: function () {
                    this.loader.hide();
                },

                show: function () {
                    this.loader.show();
                }

            });

            Layout.ControlView = Backbone.Marionette.ItemView.extend({

                template: "#controlTemplate",

                bannerItem: Handlebars.compile(
                    $('#bannerItemTemplate').html()
                ),

                className: "panel panel-default control-block",

                attributes: {
                    "draggable": true
                },

                initialize: function () {
                    this.listenTo(App.vent, "iframe:loaded", this.hideLoader);
                    this.listenTo(App, "save-finish", this.insert);
                },

                ui: {
                    formUrl: ".Url-Form",
                    inputUrl: ".Url-Input",
                    buttonUrl: ".Url-Button",
                    buttonFix: ".Fix-Button",
                    buttonChoose: ".Banner-Choose",
                    inputPath: ".Banner-Path",
                    inputFile: ".Banner-File",
                    buttonUpload: ".Banner-Upload",
                    buttonPath: ".Banner-Button",
                    formFile: ".Banner-Form",
                    buttonSave: ".Banner-Save",
                    adriverMenu: ".MenuAdriver",
                    adfoxMenu: ".MenuAdfox",
                    adriverList: ".Items-Adriver",
                    adfoxList: ".Items-Adfox",
                    adfoxItems: ".Item-Adfox",
                    adriverItems: ".Item-Adriver",
                    adriverLabel: ".Adriver-Label",
                    adfoxLabel: ".Adfox-Label",
                    adriverButton: "#adriver",
                    adfoxButton: "#adfox",
                    exposureUrl: ".Exposure-Url"
                },

                events: {
                    "click @ui.buttonUrl": "submitUrl",
                    "click @ui.buttonFix": "fix",
                    "keydown @ui.inputUrl": "onkeydownUrl",
                    "click @ui.buttonChoose": "choose",
                    "click @ui.buttonUpload": "upload",
                    "change @ui.inputFile": "upload",
                    "click @ui.buttonPath": "insert",
                    "submit @ui.formFile": "submit",
                    "click @ui.adriverItems": "chooseAdriver",
                    "click @ui.adfoxItems": "chooseAdfox",
                    "click @ui.buttonSave": "save",
                    "click @ui.exposureUrl": "selectExposure"
                },

                modelEvents: {
                    "sync": "onsync",
                    "change:exposureUrl": "setExposure",
                    "change:url": "showLoader"
                },

                fix: function (e) {
                    e.preventDefault();
                    App.execute("matchHeight");
                },

                onkeydownUrl: function (e) {
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        this.submitUrl();
                    }
                },

                selectExposure: function () {
                    this.ui.exposureUrl[0].setSelectionRange(0, this.ui.exposureUrl[0].value.length);
                },

                setExposure: function () {
                    this.ui.exposureUrl.val(this.model.get("exposureUrl"));
                    this.selectExposure();
                },
                /*initialize: function () {
                    this.on("destroy", function () {
                        this.stopListening();
                    });
                },*/

                chooseAdriver: function (e) {
                    e.preventDefault();
                    var $el = e.currentTarget;
                    this.ui.adriverLabel.html("Custom");
                    this.ui.adfoxLabel.html("");
                    this.ui.adriverButton.removeClass("btn-default").addClass("btn-info");
                    this.ui.adfoxButton.removeClass("btn-info").addClass("btn-default");
                    App.trigger("banner:system", {
                        system: "adriver",
                        type: "custom",
                        template: adriver
                    });
                },

                chooseAdfox: function (e) {
                    e.preventDefault();
                    var $el = $(e.currentTarget),
                        type = $el.html().toLocaleLowerCase(),
                        system = "adfox";
                        template = codes[system + "." + type];
                    this.ui.adfoxLabel.html($el.html());
                    this.ui.adriverLabel.html("");
                    this.ui.adfoxButton.removeClass("btn-default").addClass("btn-info");
                    this.ui.adriverButton.removeClass("btn-info").addClass("btn-default");
                    App.trigger("banner:system", {
                        system: "adfox",
                        type: type,
                        template: template
                    });
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
                    App.trigger("upload:start");
                    var formData = new FormData(),
                        files = this.ui.inputFile[0].files;
                    for (var i = 0, file; file = files[i]; ++i) {
                        formData.append(file.name, file);
                    }
                    this.model.get("uuid") && formData.append("uuid", this.model.get("uuid"));

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', '/files', true);
                    xhr.onload = function(e) {
                        var data, files;
                        try {
                            data = JSON.parse(e.currentTarget.responseText);
                        } catch (e) {}
                        data && data.uuid && this.model.set("uuid", data.uuid);
                        if (data.files) {
                            files = this.model.get("files") || [];
                            files = files.concat(data.files);
                            this.model.set("files", files);
                            App.trigger("upload:finish");
                        }
                    }.bind(this);

                    xhr.send(formData);
                },

                insert: function (e) {
                    if (e && e.preventDefault) e.preventDefault();
                    var elem = this.model.get("dom");
                    if (!elem) return;
                    this.model.set("server", this.ui.inputPath.val());
                    App.trigger("banner:insert", {
                        node: elem,
                        server: config.appUrl + 'files/' + this.model.get('uuid') + '/'
                    });
                    this.model.set("placeholderID", elem.childNodes[0].id);
                },

                getContent: function (e) {
                    var content = App.request('content');
                },

                onsync: function (e) {
                    this.loader.hide();
                },

                save: function (e) {
                    e.preventDefault();
                    App.execute("save");
                    this.loader.show();
                },

                submitUrl: function (e) {
                    e && e.preventDefault();
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
                },

                onShow: function () {
                    var view = this,
                        adriverItems = Resources.adriver.items.reduce(function (res, value) {
                            return res + view.bannerItem({
                                system: "Adriver",
                                title: value
                            });
                        }, ""),
                        adfoxItems = Resources.adfox.items.reduce(function (res, value) {
                            return res + view.bannerItem({
                                system: "Adfox",
                                title: value
                            });
                        }, "");
                    this.ui.adriverList.html(adriverItems);
                    this.ui.adfoxList.html(adfoxItems);

                    this.loader = new App.Layout.LoaderView({el: this.$el});
                    this.listenTo(App, "upload:start", this.showLoader);
                    this.listenTo(App, "upload:finish", this.hideLoader);
                },

                showLoader: function () {
                    this.loader.show();
                },

                hideLoader: function () {
                    this.loader.hide();
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
                    App.commands.setHandler("matchHeight", function() {
                        this.ui.iframe.trigger("load");
                    }.bind(this));

                },

                matchHeight: function () {
                    var interfaceHeight = $("#control").height();
                    this.ui.iframe.height(
                        interfaceHeight + $(this.ui.iframe[0].contentDocument).height()
                    );
                },

                load: function (e) {
                    App.vent.trigger("iframe:loaded");
                    this.matchHeight();
                },

                setUrl: function () {
                    this.ui.iframe.attr('src', "/url?q=" + this.model.get("url"));
                    this.ui.iframe.height(700);
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

                system: {

                    template: codes["adfox.flash"],
                    system:"adfox",
                    type:"flash"
                },

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

                    this.listenTo(App, "banner:system", function (params) {

                        this.system = params;

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
                    /*script.innerHTML = replace({
                        id:id,
                        server: params.server,
                        file: "/files/395212.swf"
                    }, this.system.template);*/

                    var qs = $.param({
                        id:id,
                        server: params.server,
                        files: this.app.reqres.request("getModel").get("files"),
                        code: [this.system.system, this.system.type].join(".")
                    });

                    script.src = "/script?" + qs;
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
                url:"/put",
                defaults: {
                    files: []
                }
            }));

            model.listenTo(App.vent, "iframe:chosen", function (elem) {
                model.set("dom", elem);
            });

            model.listenTo(App.vent, "iframe:destroy", function () {
                model.set("dom", null);
            });

            App.commands.setHandler("save", function (data) {

                var content = App.request('content');
                App.trigger("save-start", {
                    content: content
                });
                var dom = model.get("dom");
                model.set("dom", null);

                model
                    .set("content", content)
                    .save(
                        model.toJSON(),
                    {
                        success: function () {
                            App.trigger("save");
                            App.trigger("save-finish");
                        }
                    });
                model.set("dom", dom);
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

                app.controlRegion.$el.children(0)
                    .draggable();

            });

            app.reqres.setHandler("getModel", function () {
                return model;
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

        app.start();

        return app;
});