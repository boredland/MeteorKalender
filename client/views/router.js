import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

Router.configure({
	templateNameConverter: "upperCamelCase",
	routeControllerNameConverter: "upperCamelCase",
	layoutTemplate: "layout",
	notFoundTemplate: "notFound",
	loadingTemplate: "loading"
});

var publicRoutes = [
	"home_public",
	"login",
	"register",
	//"verify_booking",
    "verify_email",
    "forgot_password",
	"reset_password"
];

var privateRoutes = [
	"home_private",
	"user_settings",
	"user_settings.profile",
	"user_settings.change_pass",
    "home_private.appointments",
    "home_private.availabilities",
    "home_private.new_availability",
    "home_private.edit_availability",
    "home_private.calendars",
    "home_private.new_calendar",
    "home_private.edit_calendar",
    "logout"
];

var freeRoutes = [
];

var roleMap = [

];

this.firstGrantedRoute = function(preferredRoute) {
	if(preferredRoute && routeGranted(preferredRoute)) return preferredRoute;

	var grantedRoute = "";

	_.every(privateRoutes, function(route) {
		if(routeGranted(route)) {
			grantedRoute = route;
			return false;
		}
		return true;
	});
	if(grantedRoute) return grantedRoute;

	_.every(publicRoutes, function(route) {
		if(routeGranted(route)) {
			grantedRoute = route;
			return false;
		}
		return true;
	});
	if(grantedRoute) return grantedRoute;

	_.every(freeRoutes, function(route) {
		if(routeGranted(route)) {
			grantedRoute = route;
			return false;
		}
		return true;
	});
	if(grantedRoute) return grantedRoute;

	if(!grantedRoute) {
		// what to do?
		console.log("All routes are restricted for current user.");
	}

	return "";
}

// this function returns true if user is in role allowed to access given route
this.routeGranted = function(routeName) {
	if(!routeName) {
		// route without name - enable access (?)
		return true;
	}

	if(!roleMap || roleMap.length === 0) {
		// this app don't have role map - enable access
		return true;
	}

	var roleMapItem = _.find(roleMap, function(roleItem) { return roleItem.route === routeName; });
	if(!roleMapItem) {
		// page is not restricted
		return true;
	}

	if(!Meteor.user() || !Meteor.user().roles) {
		// user is not logged in
		return false;
	}

	// this page is restricted to some role(s), check if user is in one of allowedRoles
	var allowedRoles = roleMapItem.roles;
	var granted = _.intersection(allowedRoles, Meteor.user().roles);
	if(!granted || granted.length === 0) {
		return false;
	}

	return true;
};

Router.ensureLogged = function() {
	if(Meteor.userId() && (!Meteor.user() || !Meteor.user().roles)) {
		this.render('loading');
		return;
	}
	var redirectRoute;
	if(!Meteor.userId()) {
		// user is not logged in - redirect to public home
		redirectRoute = firstGrantedRoute("home_public");
		this.redirect(redirectRoute);
	} else {
		// user is logged in - check role
		if(!routeGranted(this.route.getName())) {
			// user is not in allowedRoles - redirect to first granted route
			redirectRoute = firstGrantedRoute("home_private");
			this.redirect(redirectRoute);
		} else {
			this.next();
		}
	}
};

Router.ensureNotLogged = function() {
	if(Meteor.userId() && (!Meteor.user() || !Meteor.user().roles)) {
		this.render('loading');
		return;
	}

	if(Meteor.userId()) {
		var redirectRoute = firstGrantedRoute("home_private");
		this.redirect(redirectRoute);
	}
	else {
		this.next();
	}
};

// called for pages in free zone - some of pages can be restricted
Router.ensureGranted = function() {
	if(Meteor.userId() && (!Meteor.user() || !Meteor.user().roles)) {
		this.render('loading');
		return;
	}

	if(!routeGranted(this.route.getName())) {
		// user is not in allowedRoles - redirect to first granted route
		var redirectRoute = firstGrantedRoute("");
		this.redirect(redirectRoute);
	} else {
		this.next();
	}
};

Router.waitOn(function() {
	Meteor.subscribe("current_user_data");
});

Router.onBeforeAction(function() {
	// loading indicator here
	if(!this.ready()) {
		this.render('loading');
		$("body").addClass("wait");
	} else {
		$("body").removeClass("wait");
		this.next();
	}
});

Router.onBeforeAction(Router.ensureNotLogged, {only: publicRoutes});
Router.onBeforeAction(
	Router.ensureLogged, {only: privateRoutes}
);
Router.onBeforeAction(Router.ensureGranted, {only: freeRoutes}); // yes, route from free zone can be restricted to specific set of user roles

Router.map(function () {
    // Default Routes
	this.route("home_public", {path: "/", controller: "HomePublicController"});
	this.route("login", {path: "/login", controller: "LoginController"});
	this.route("register", {path: "/register", controller: "RegisterController"});
    this.route("verify_email", {path: "/verify_email/:verifyEmailToken", controller: "VerifyEmailController"});
    this.route("forgot_password", {path: "/forgot_password", controller: "ForgotPasswordController"});
    this.route("reset_password", {path: "/reset_password/:resetPasswordToken", controller: "ResetPasswordController"});

    // Public Routes
    this.route("verify_booking", {path: "/verify_booking/:verifyBookingToken", controller: "VerifyBookingController", template: "VerifyBooking"});
    this.route("cancel_booking", {path: "/cancel_booking/:cancelBookingToken", controller: "CancelBookingController"});
    // --> With data
    this.route("calendar_public", {
        path: "/calendar_public/:_calendarSlug",
        controller: "CalendarPublicController",
        template: 'CalendarPublic', // <-- to be explicit
        /**
         *
         * @returns {Array}
         */
        data: function(){
            var currentCalendarSlug = this.params._calendarSlug;
            var currentCalendarFull, currentCalendarPublic, currentAvailabilities,availabilitySubscription,calendarSubscription;
            calendarSubscription = Meteor.subscribe('singlePublicCalendarBySlug', currentCalendarSlug);
            // ready() is true if all items in the wait list are ready
            if (calendarSubscription.ready()) {
                currentCalendarFull = Calendars.findOne({});
                currentCalendarPublic = currentCalendarFull;
                if (currentCalendarFull !== undefined){
                    availabilitySubscription = Meteor.subscribe('allPublicFutureAvailabilitiesByCalendarId', currentCalendarFull._id);
                    if (availabilitySubscription.ready()){
                        currentCalendarPublic = Calendars.findOne({},{fields: {name: 1, location: 1, linkslug: 1}});
                        currentAvailabilities = Availabilities.find().fetch().map( ( availability ) => {
                            if (availability !== undefined){
                                var color,title;
                                /**
                                 * Confirmed or (unconfirmed and timestamp younger than moment-10m)
                                 */
                                if (availability.bookedByConfirmed) {
                                    color = "#FF0000";
                                    title = "booked";
                                } else if (moment(availability.bookedByDate) >= moment().add(-10,'m') && !availability.bookedByConfirmed && availability.bookedByDate){
                                    color = "#FFFF00";
                                    title = "reserved";
                                } else if (!availability.bookedByConfirmed && ((moment(availability.bookedByDate) < moment().add(-10,'m'))||!availability.bookedByDate)){
                                    color = "#008000";
                                    title = "free";
                                } else {
                                    color = "#800080"
                                }
                                availability = {start: availability.startDate,end: availability.endDate, id: availability._id, color: color, title: title};
                                //console.log(availability);
                                return availability;
                            }
                        });
                    }
                }

            }
            /**
             *
             */
            if ((currentCalendarPublic && availabilitySubscription.ready()) || !currentCalendarPublic){
                this.render();
                var resultarray = [];
                if (currentCalendarPublic) {
                    resultarray.push(currentCalendarPublic);
                } else if (!currentCalendarPublic) {
                    resultarray.push(undefined);
                }
                if (currentAvailabilities && currentCalendarPublic) {
                    resultarray.push(currentAvailabilities);
                } else if (!currentAvailabilities) {
                    resultarray.push(undefined);
                }
                return resultarray;
            } else {
                this.render('Loading');
            }
        }
    });
    this.route("calendar_public.book", {
        path: "/book_availability/:_availabilityId/:_calendarSlug",
        controller: "BookingController",
        template: 'Booking', // <-- to be explicit
        waitOn: function () {
          return [
              Meteor.subscribe('singlePublicCalendarBySlug', this.params._calendarSlug),
              Meteor.subscribe('singlePublicAvailabilityById', this.params._availabilityId)
          ]
        }
    });

    // Private Routes
	this.route("home_private", {path: "/home_private", controller: "HomePrivateController"});
    this.route("user_settings", {path: "/user_settings", controller: "UserSettingsController"});
    this.route("user_settings.profile", {path: "/user_settings/profile", controller: "UserSettingsProfileController"});
    this.route("user_settings.change_pass", {path: "/user_settings/change_pass", controller: "UserSettingsChangePassController"});
    this.route("logout", {path: "/logout", controller: "LogoutController"});

	// Availabilities
    this.route("home_private.edit_availability", {
    	path: "/home_private/edit_availability/:_eventId",
		controller: "EditAvailabilityController",
		template: 'EditAvailability',
        waitOn: function () {
            return [
                Meteor.subscribe('singleAvailabilityById', this.params._eventId),
            	Meteor.subscribe('allCalendars')
            ]
        },
        data: function () {
            if (this.ready()){
            	var availability = Availabilities.findOne({_id: this.params._eventId});
                return availability;
                //this.render();
            } else {
                this.render('Loading');
            }
        }
	});
    this.route("home_private.new_availability", {path: "/home_private/new_availability", controller: "NewAvailabilityController"});
    this.route("home_private.availabilities", {
    	path: "/home_private/availabilities",
		controller: "AvailabilitiesController",
		template: 'Availabilities',
        waitOn: function () {
            return [
                Meteor.subscribe('allFutureAvailabilities',0),
            	Meteor.subscribe('allCalendars')
            ]
        }
    });

    // Appointments
    this.route("home_private.appointments", {
    	path: "/home_private/appointments",
		controller: "AppointmentsController",
        template: "Appointments"
    });
    this.route("home_private.appointment", {
    	path: "/home_private/appointment/:_eventId",
		controller: "AppointmentController",
		template: "Appointment",
		data: function () {
			var currentAvailabilityId = this.params._eventId;
            this.wait(Meteor.subscribe('singleAvailabilityById', currentAvailabilityId));
            var currentAvailability = Availabilities.findOne({_id: currentAvailabilityId});
            if (this.ready()){
                return currentAvailability;
                //this.render();
            } else {
                this.render('Loading');
            }
        }
    });

    // Calendars
    this.route("home_private.calendars", {path: "/home_private/calendars", controller: "CalendarsController"});
    this.route("home_private.new_calendar", {path: "/home_private/new_calendar", controller: "NewCalendarController"});
    this.route("home_private.edit_calendar", {path: "/home_private/edit_calendar/:_calendarId", controller: "EditCalendarController"});
    });
