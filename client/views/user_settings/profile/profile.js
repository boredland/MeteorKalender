var pageSession = getDefaultPageSession();

Template.UserSettingsProfile.rendered = function() {
	
};

Template.UserSettingsProfile.events({
	
});

Template.UserSettingsProfile.helpers({
	
});

Template.UserSettingsProfileEditForm.rendered = function() {
	pageSession.set("userSettingsProfileEditFormInfoMessage", "");
	pageSession.set("userSettingsProfileEditFormErrorMessage", "");
};

Template.UserSettingsProfileEditForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("userSettingsProfileEditFormInfoMessage", "");
		pageSession.set("userSettingsProfileEditFormErrorMessage", "");

		var self = this;

		function submitAction(msg) {
			var userSettingsProfileEditFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(userSettingsProfileEditFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("userSettingsProfileEditFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("user_settings.profile", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("userSettingsProfileEditFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				Meteor.call("updateUserAccount", t.data.current_user_data._id, values, function(e) { if(e) errorAction(e); else submitAction(); });
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		

		/*CANCEL_REDIRECT*/
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		/*CLOSE_REDIRECT*/
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		/*BACK_REDIRECT*/
	},
    "click #copy-button": function(e) {
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
        setInfoMessage(pageSession,"Link is copied to your clipboard!");
    }
});

Template.UserSettingsProfileEditForm.helpers({
    getPageSession: function () {
        return pageSession;
    },
    tokenUrl: function() {
        return Meteor.absoluteUrl() + "ical/" + Meteor.user().profile.secure;
    }
});
