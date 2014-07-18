console.log("hi");
parent.$(parent.document.getElementById("content")).trigger("load:after");
(function () {

    var app = new parent.app.Inject.InnerApp(window);

}());