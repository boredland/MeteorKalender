var pageSession = getDefaultPageSession();

Template.layout.rendered = function () {
    // scroll to anchor
    $('body').on('click', 'a', function (e) {
        var href = $(this).attr("href");
        if (!href) {
            return;
        }
        if (href.length > 1 && href.charAt(0) === "#") {
            var hash = href.substring(1);
            if (hash) {
                e.preventDefault();

                var offset = $('*[id="' + hash + '"]').offset();

                if (offset) {
                    $('html,body').animate({scrollTop: offset.top - 60}, 400);
                }
            }
        } else {
            if (href.indexOf("http://") !== 0 && href.indexOf("https://") !== 0 && href.indexOf("#") !== 0) {
                $('html,body').scrollTop(0);
            }
        }
    });
    /*TEMPLATE_RENDERED_CODE*/
};

Template.layout.events({
    "click": function (event) { // Fix Bootstrap Dropdown Menu Collapse on click outside Menu
        var clickover = $(event.target).closest(".dropdown-toggle").length;
        var opened = $(".navbar-collapse").hasClass("in");
        if (opened === true && !clickover) {
            $('.navbar-collapse').collapse('hide');
        }
    },

    "keyup": function (event) {
        if (event.keyCode === 27) { // Bootstrap Dropdown Menu Collapse on ESC pressed
            var opened = $(".navbar-collapse").hasClass("in");
            if (opened === true) {
                $('.navbar-collapse').collapse('hide');
            }
        }
    },

    "click #feedback": function (event, t) {
        var errorModal = function (currentModal, message) {
            currentModal.modal('hide');
            bootbox.alert(message, function () {
                currentModal.modal('show');
            });
            throw new Error(message);
        };
        var footer = document.evaluate("//*[@id=\"footer\"]/div/p/text()", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        var built = footer.textContent.match(/(BUILD_)(.+)/)[2];
        var promptBug = bootbox.prompt({
            animate: false,
            title: "Please provide a short description about what didn't happen as expected:",
            inputType: "textarea",
            callback: function (result) {
                if (result !== "" && result !== null) {
                    var message = result;
                    promptBug.modal('hide');
                    var promptContactMail = bootbox.prompt({
                        animate: false,
                        title: "Please provide an email-address, so we can keep you up to date regarding this bug:",
                        inputType: "email",
                        callback: function (result) {
                            if (result !== "" && result !== null) {
                                var email = result;
                                promptContactMail.modal('hide');
                                var promptContactName = bootbox.prompt({
                                    animate: false,
                                    title: "Please provide your name:",
                                    inputType: "text",
                                    callback: function (result) {
                                        if (result !== "" && result !== null) {
                                            var name = result;
                                            var place = window.location.pathname;
                                            var server = window.location.origin;
                                            var currentBrowser = BrowserDetect.browser + " " + BrowserDetect.version + " on " + BrowserDetect.OS;
                                            var resolution = "Height: " + window.innerHeight + " Width: " + window.innerWidth;
                                            Meteor.call('sendFeedback', name, email, place, message, server, currentBrowser, resolution, built);
                                        } else if (result === null) {
                                            // Closes the modal.
                                        } else {
                                            //catches the field not being set.
                                            errorModal(promptContactName, "Name has not been set.");
                                        }
                                    }
                                });
                            } else if (result === null) {
                                // Closes the modal.
                            } else {
                                //catches the field not being set.
                                errorModal(promptContactMail, "Email has not been set.");
                            }
                        }
                    });
                } else if (result === null) {
                    // Closes the modal.
                } else {
                    //catches the field not being set.
                    errorModal(promptBug, "Please specify a message");
                }
            }
        });

    }
});

Template.layout.helpers({
    "privateData": function () {
        return {
            params: this.params || {}
        };

    },
    "publicData": function () {
        return {
            params: this.params || {}
        };

    },
    getPageSession: function () {
        return pageSession;
    }
});

Template.PublicLayoutLeftMenu.rendered = function () {
    $(".menu-item-collapse .dropdown-toggle").each(function () {
        if ($(this).find("li.active")) {
            $(this).removeClass("collapsed");
        }
        $(this).parent().find(".collapse").each(function () {
            if ($(this).find("li.active").length) {
                $(this).addClass("in");
            }
        });
    });

};

Template.PublicLayoutLeftMenu.events({
    "click .toggle-text": function (e, t) {
        e.preventDefault();
        $(e.target).closest("ul").toggleClass("menu-hide-text");
    }

});

Template.PublicLayoutLeftMenu.helpers({});

Template.PublicLayoutRightMenu.rendered = function () {
    $(".menu-item-collapse .dropdown-toggle").each(function () {
        if ($(this).find("li.active")) {
            $(this).removeClass("collapsed");
        }
        $(this).parent().find(".collapse").each(function () {
            if ($(this).find("li.active").length) {
                $(this).addClass("in");
            }
        });
    });

};

Template.PublicLayoutRightMenu.events({
    "click .toggle-text": function (e, t) {
        e.preventDefault();
        $(e.target).closest("ul").toggleClass("menu-hide-text");
    }

});

Template.PublicLayoutRightMenu.helpers({});

Template.PrivateLayout.onCreated(function () {
    var subs = [];
});

Template.PrivateLayoutLeftMenu.rendered = function () {
    $(".menu-item-collapse .dropdown-toggle").each(function () {
        if ($(this).find("li.active")) {
            $(this).removeClass("collapsed");
        }
        $(this).parent().find(".collapse").each(function () {
            if ($(this).find("li.active").length) {
                $(this).addClass("in");
            }
        });
    });

};

Template.PrivateLayoutLeftMenu.events({
    "click .toggle-text": function (e, t) {
        e.preventDefault();
        $(e.target).closest("ul").toggleClass("menu-hide-text");
    }

});

Template.PrivateLayoutLeftMenu.helpers({});

Template.PrivateLayoutRightMenu.rendered = function () {
    $(".menu-item-collapse .dropdown-toggle").each(function () {
        if ($(this).find("li.active")) {
            $(this).removeClass("collapsed");
        }
        $(this).parent().find(".collapse").each(function () {
            if ($(this).find("li.active").length) {
                $(this).addClass("in");
            }
        });
    });

};

Template.PrivateLayoutRightMenu.events({
    "click .toggle-text": function (e, t) {
        e.preventDefault();
        $(e.target).closest("ul").toggleClass("menu-hide-text");
    }

});

Template.PrivateLayoutRightMenu.helpers({});
