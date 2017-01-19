var pageSession = getDefaultPageSession();

Template.UserSettings.rendered = function () {
    $("input[autofocus]").focus();

    setInfoMessage(pageSession, "");
    setErrorMessage(pageSession, "");
};

Template.UserSettings.events({
    'submit #change_pass_form': function (e, t) {
        e.preventDefault();

        nullMessages(pageSession);

        var submit_button = $(t.find(":submit"));

        var old_password = t.find('#old_password').value;
        var new_password = t.find('#new_password').value;
        var confirm_pass = t.find('#confirm_pass').value;

        if (old_password === "") {
            setErrorMessage(pageSession, "Please enter your old password.");
            t.find('#old_password').focus();
            return false;
        }
        if (new_password === "") {
            setErrorMessage(pageSession, "Please enter your new password.");
            t.find('#new_password').focus();
            return false;
        }
        if (confirm_pass === "") {
            setErrorMessage(pageSession, "Please confirm your new password.");
            t.find('#confirm_pass').focus();
            return false;
        }

        // check new password
        if (new_password !== confirm_pass) {
            setErrorMessage(pageSession, "Your new password and confirm password don't match.");
            t.find('#new_password').focus();
            return false;
        }

        submit_button.button("loading");
        Accounts.changePassword(old_password, new_password, function (err) {
            submit_button.button("reset");
            if (err) {
                setErrorMessage(pageSession, err.message);
                return false;
            } else {
                nullMessages(pageSession);
                setInfoMessage(pageSession, "Your new password is set.");
                t.find('#old_password').value = "";
                t.find('#new_password').value = "";
                t.find('#confirm_pass').value = "";
                t.find('#old_password').focus();
            }
        });
        return false;
    },

    "submit #save_profile": function (e, t) {
        e.preventDefault();
        setInfoMessage(pageSession, "");
        setErrorMessage(pageSession, "");
        var self = this;


        var old_mail = t.find('#user_email_old').value;
        var new_mail = t.find('#user_email_new').value;
        var new_mail_confirm = t.find('#user_email_confirm').value;

        function submitAction(msg, values) {
            var userSettingsProfileEditFormMode = "update";
            if (!t.find("#form-cancel-button")) {
                switch (userSettingsProfileEditFormMode) {
                    case "insert": {
                        $(e.target)[0].reset();
                    }
                        break;

                    case "update": {
                        var message = msg || "Saved.";
                        if (values && values.profile.email) {
                            message = message + " Your verification has been reset, please click on the link sent to your new email-address."
                        }
                        setInfoMessage(pageSession, message, null);
                    }
                        break;
                }
            }

            Router.go("user_settings", {});
        }

        function errorAction(msg) {
            msg = msg || "";
            var message = msg.message || msg || "Error.";
            setErrorMessage(pageSession, message);
        }

        validateForm(
            $(e.target),
            function (fieldName, fieldValue) {

            },
            function (msg) {

            },
            function (values) {
                /* eine neue e-mail adresse wird übergeben */
                if (old_mail === "" && (new_mail !== "" || new_mail_confirm !== "")) {
                    setErrorMessage(pageSession, "You have to enter your old e-mail address");
                    t.find('#user_email_old').focus();
                    return false;
                }
                /* alle felder gesetzt */
                if (old_mail !== "" && new_mail !== "" && new_mail_confirm !== "") {
                    if (old_mail !== t.data.current_user_data.profile.email) {
                        setErrorMessage(pageSession, "The e-mail you entered as your old e-mail address is not correct.");
                        t.find('#user_email_old').focus();
                        return false;
                    }
                    if (new_mail !== new_mail_confirm) {
                        setErrorMessage(pageSession, "The new e-mail addresses you entered aren't identical.");
                        t.find('#user_email_confirm').focus();
                        return false;
                    }
                    if (!isValidEmail(new_mail)) {
                        setErrorMessage(pageSession, "Please enter valid e-mail address that ends with .fra-uas.de, .frankfurt-unversity.de or fh-frankfurt.de.");
                        t.find('#user_email_confirm').focus();
                        return false;
                    }
                } else {
                    values.profile.email = new_mail;
                }
                console.log(values);
                // remove email if it didn't change
                console.log(t.data.current_user_data);
                if (t.data.current_user_data.profile.email === values.profile.email || values.profile.email === "") {
                    delete values.profile.email;
                }
                if (t.data.current_user_data.profile.name === values.profile.name || values.profile.name === "") {
                    delete values.profile.name;
                }
                Meteor.call("updateUserAccount", t.data.current_user_data._id, values, function (e) {
                    if (e) errorAction(e);
                    else submitAction(undefined, values);
                });
            }
        );

        return false;
    },
    "click #form-cancel-button": function (e, t) {
        e.preventDefault();


        /*CANCEL_REDIRECT*/
    },
    "click #form-close-button": function (e, t) {
        e.preventDefault();

        /*CLOSE_REDIRECT*/
    },
    "click #form-back-button": function (e, t) {
        e.preventDefault();

        /*BACK_REDIRECT*/
    },
    "click #copy-button": function (e) {
        e.preventDefault();
        var me = this;
        var link = window.location.origin + "/ical/" + me.current_user_data.profile.secure;
        // Create an auxiliary hidden input
        var aux = document.createElement("input");
        // Get the text from the element passed into the input
        aux.setAttribute("value", link);
        // Append the aux input to the body
        document.body.appendChild(aux);
        // Highlight the content
        aux.select();
        // Execute the copy command
        document.execCommand("copy");
        // Remove the input from the body
        document.body.removeChild(aux);
        setInfoMessage(pageSession, "Link is copied to your clipboard!");
    }

});

Template.UserSettings.helpers({
    getPageSession: function () {
        return pageSession;
    },
    tokenUrl: function () {
        return Meteor.absoluteUrl() + "ical/" + Meteor.user().profile.secure;
    }
});