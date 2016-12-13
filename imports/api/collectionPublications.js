/**
 * Created by jonasstr on 12.12.16.
 */
import {Meteor} from "meteor/meteor";
import {Calendars} from '/imports/api/calendarsCollection';
import {Availabilities} from '/imports/api/availabilitiesCollection';

if (Meteor.isServer) {
    /**
     * These are publications for private users
     */
    Meteor.publish('allAvailabilities', function availabilitiesPublication() {
        return Availabilities.find({userId: this.userId}, {sort: {startdate: -1}});
    });
    Meteor.publish('allFutureAvailabilities', function availabilitiesPublication(pastminutes) {
        return Availabilities.find({userId: this.userId, startDate: {$gt: new Date(moment().add(-pastminutes,'m'))}}, {sort: {startdate: -1}});
    });
    Meteor.publish('allCalendars', function calendarsPublication() {
        return Calendars.find({userId: this.userId});
    });
    Meteor.publish('singleCalendar', function calendarsPublication(input_calendarId) {
        var calendar = Calendars.find({_id: input_calendarId, userId: this.userId});
        return calendar;
    });
    Meteor.publish('singleAvailabilityById', function availabilitiesPublication(input_availabilityid) {
        var availability = Availabilities.find({_id: input_availabilityid, userId: this.userId});
        return availability;
    });

    /**
     * These are public publications
     */
    Meteor.publish('allPublicFutureAvailabilitiesByCalendarId', function availabilitiesPublication(input_calendarid) {
        var calendar = Calendars.findOne({_id: input_calendarid.toString(), published: true});
        var options = {fields: {startDate: 1, endDate: 1, bookedByConfirmed: 1, bookedByDate: 1}, sort: {startdate: -1}};
        var calendarEvents = Availabilities.find({calendarId: calendar._id, startDate: {$gt: new Date()}}, options);
        return calendarEvents;
    });
    Meteor.publish('singlePublicAvailabilityById', function availabilitiesPublication(input_availabilityId) {
        var availabilityOptions = {fields: {_id: 1, startDate: 1, endDate: 1}};
        var availability = Availabilities.find({_id: input_availabilityId.toString()}, availabilityOptions);

        return availability;
    });
    Meteor.publish('singlePublicCalendarBySlug', function calendarsPublication(input_calendarSlug) {
        var calendarOptions = {fields: {_id: 1, name: 1, location: 1,linkslug: 1}};
        var calendar = Calendars.find({linkslug: input_calendarSlug, published: true},calendarOptions);
        return calendar;
    });
};