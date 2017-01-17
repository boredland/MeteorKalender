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
	"calendar_overview",
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
    "home_private.appointments",
    "home_private.availabilities",
    "home_private.new_availability",
    "home_private.edit_availability",
    "home_private.calendars",
    "home_private.new_calendar",
    "home_private.edit_calendar",
    "logout",
	"faq"
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
    this.route("calendar_overview", {
        path: "/calendar_overview",
        controller: "CalendarOverviewController",
        waitOn: function () {
            Meteor.subscribe('allPublicCalendarsWithOwners');
        }
    });
    this.route("calendar_public", {
        path: "/calendar_public/:_calendarSlug",
        controller: "CalendarPublicController",
        template: 'CalendarPublic', // <-- to be explicit
        waitOn: function () {
            Meteor.subscribe('singlePublicCalendarBySlug', this.params._calendarSlug);
			if (Calendars.findOne({})){
                return [
                    Meteor.subscribe('singlePublicCalendarBySlug', this.params._calendarSlug),
                    Meteor.subscribe('allPublicFutureAvailabilitiesByCalendarSlug',this.params._calendarSlug)
                ]
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
    this.route("user_settings", {path: "/user_settings", controller: "UserSettingsController",template: 'UserSettings'});
    this.route("logout", {path: "/logout", controller: "LogoutController"});
    this.route("faq", {path: "/faq"});

	// Availabilities
    this.route("home_private.edit_availability", {
    	path: "/home_private/edit_availability/:_availabilityId",
		controller: "EditAvailabilityController",
		template: 'EditAvailability',
        waitOn: function () {
            return [
                Meteor.subscribe('singleAvailabilityById', this.params._availabilityId),
            	Meteor.subscribe('allCalendars')
            ]
        }
	});
    this.route("home_private.new_availability", {path: "/home_private/new_availability", controller: "NewAvailabilityController"});
    this.route("home_private.availabilities", {
    	path: "/home_private/availabilities",
		controller: "AvailabilitiesController",
		template: 'Availabilities',
        waitOn: function () {
            return [
                Meteor.subscribe('allFutureAvailabilitiesAndAllAppointments'),
            	Meteor.subscribe('allCalendars')
            ]
        }
    });

    // Appointments
    this.route("home_private.appointments", {
    	path: "/home_private/appointments",
		controller: "AppointmentsController",
        template: "Appointments",
		waitOn: function () {
            return [
            	Meteor.subscribe('allAppointments'),
				Meteor.subscribe('allCalendars')
				]
        }
    });
    this.route("home_private.appointment", {
    	path: "/home_private/appointment/:_appointmentId",
		controller: "AppointmentController",
		template: "Appointment",
        waitOn: function () {
            return [
                Meteor.subscribe('singleAvailabilityById', this.params._appointmentId)
            ]
        }
    });

    // Calendars
    this.route("home_private.calendars", {path: "/home_private/calendars", controller: "CalendarsController"});
    this.route("home_private.new_calendar", {path: "/home_private/new_calendar", controller: "NewCalendarController"});
    this.route("home_private.edit_calendar", {
    	path: "/home_private/edit_calendar/:_calendarId",
		controller: "EditCalendarController",
        template: "EditCalendar",
        waitOn: function () {
            return [
                Meteor.subscribe('singleCalendar',this.params._calendarId)
            ]
        }
    });
});
