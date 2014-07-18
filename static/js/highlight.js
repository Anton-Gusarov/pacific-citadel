define(
    [
        "desktopCobrowseHtml",
        "viewUtils"
//        "desktopViewer",
//        "session",
//        "config/lang",
//        "DOMObserver",
//        "application/dispatcher",
//        "../desktop2/cobrowseMessage"
    ],
    function (coBrowseHtml, ViewUtils, Session, Lang, DOMObserver, Dispatcher, cobrowseMessage) {

        return function (ctx) {

            var confirmHandler = function () {};
            var rhCoBrowse = (function () {
                jQuery("body", ctx.document).prepend("<div/>");
                $(ctx.document).find("body").append($(coBrowseHtml, ctx.document))

                /*Dispatcher.addEventListener("reloadHTML", function () {
                    jQuery(coBrowseHtml).appendTo('body');
                });*/

                var pulsing = false;
                var highlightStack = [];
                var returnMouse = false;
                var highlighter = function () {
                    var that = this;
                    while (highlightStack.length) {
                        highlightStack.pop();
                    }
                    var currentBox = ViewUtils.getBoundingBox(this);
                    currentBox.top -= 7;
                    currentBox.left -= 7;

                    currentBox.width = Math.min(currentBox.width, jQuery(ctx.document).width() - 14);
                    currentBox.height = Math.min(currentBox.height, jQuery(ctx.document).height() - 14);

                    jQuery("#rh-highlight", ctx.document).css(currentBox).show();
                    var currentDisabler = function () {
                        jQuery("#rh-highlight", ctx.document).hide();
                        jQuery(that).unbind("mouseout.redhlp", currentDisabler);
                    };

                    highlightStack.push(this);
                    jQuery(this).bind("mouseout.redhlp", currentDisabler);
                    return false;
                };

                var highlightEnabled = false;


                return {
                    highlight: function () {
                        if (highlightEnabled) {
                            return;
                        }
    //                    rhDesktop.toggleMouse(false);

                        jQuery("#rh-highlight", ctx.document).css("pointer-events", "none");
                        highlightEnabled = true;
                        var handler = function (e) {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            jQuery("*", ctx.document).unbind("mouseenter.redhlp mousemove.redhlp");

                            var element = highlightStack.pop();
                            confirmHandler = function (value) {
                                if (!value) {
                                    confirmHandler = function (value) {};
                                    return;
                                }
                                pulsing = true;
                                console.log("!@#!!@#!@#");
                                jQuery("#rh-highlight", ctx.document).show().fadeOut(300, function () {
                                    pulsing = false;
                                });

    //                            if (location.href !== rhDesktop.currentUrl) {
    //                                rhDesktop.pushInformation(Lang.LINK_OFFER_SENT);
    //                            }
                                try {
                                    console.log("Something happened");
    //                                rhDesktop.sendMessage("Command", JSON.stringify(message), 1);
                                    try {
    //                                    rhDesktop.onHighlighted();
                                    } catch (e) {}
                                    console.log("sure");
                                } catch (e) { console.log(e); }
                                confirmHandler = function (value) {};
                            };
                            highlightEnabled = false;
                            jQuery("*", ctx.document).unbind("click.redhlp").unbind("mouseout.redhlp");

    //                        rhDesktop.disableHighlight();

//                            if (location.href !== rhDesktop.currentUrl) {
//                                rhDesktop.confirmRedirect();
//                            } else {
                                confirmHandler(true);
//                            }
                            if (returnMouse) {
    //                            rhDesktop.toggleMouse(true);
                            }
                            $(rhCoBrowse).trigger("choose", [element]);
                            return false;
                        };
                        jQuery("div:not(#rh-highlight)", ctx.document)
                            .bind("mouseenter.redhlp mousemove.redhlp", highlighter)
                            .bind("click.redhlp", handler);
                    },
                    disableHighlight: function () {
                        highlightEnabled = false;
                        jQuery("*", ctx.document).unbind("mouseenter.redhlp mousemove.redhlp click.redhlp");
                        var p;
                        for (p in highlightStack) {
                            if (highlightStack.hasOwnProperty(p)) {
                                jQuery(highlightStack[p]).removeClass("rhHover");
                            }
                        }
                        if (!pulsing) {
                            jQuery("#rh-highlight", ctx.document).hide();
                        }
                    },
                    redirect: function () {
                        jQuery("a", ctx.document).bind("click.redhlp", function () {
                            /*if (!confirm(Lang.REDIRECT_PROMPT + jQuery(this).attr("href"))) {
                                return;
                            }*/
                            var message = {
                                "type": "redirect",
                                "link": jQuery(this).attr("href")
                            };
    //                        rhDesktop.sendMessage("Command", JSON.stringify(message), 1);
                            jQuery("a", ctx.document).unbind("click.redhlp");
                        });
                    }
                };
            }());

            /*rhDesktop.toggleHighlight = function (on) {
                if (on) {
                    rhCoBrowse.highlight();
                } else {
                    rhCoBrowse.disableHighlight();
                }
            };
    */
            /*Dispatcher.addEventListener("cobrowseMessage", function (message) {
                try {
                    console.log("COBROWSE MESSAGE");
                    console.log(JSON.stringify(message));
                    if (message.action === "confirm") {
                        console.log("CONFIRM MESSAGE");
                        if (message.target === "highlight") {
                            rhDesktop.pushInformation(Lang.ELEMENT_HIGHLIGHTED);
                            jQuery("#rh-highlight").click();
                        }
                        if (message.target === "redirect") {
                            rhDesktop.pushInformation(Lang.USER_FOLLOWED_LINK);
                        }
                    }
                    if (message.action === "reject") {
                        if (message.target === "redirect") {
                            rhDesktop.pushInformation(Lang.USER_REJECTED_LINK);
                        }
                    }
                    if (message.action === "session") {
                        console.log("SESSION!");
                        Session.setData(message.data);
                    }
                    if (message.action === "mutations") {
                        console.log("DOM mutation");
                        DOMObserver.mutate(message.data);
                    }
                    if (message.action === "html") {
                        console.log("HTML LOADED - NO SUPPORT");
                    }
                } catch (e) {}
            });*/

            /*rhDesktop.redirectResult = function (value) {
                confirmHandler(value);
            };*/
            return rhCoBrowse;
        }
    }
);