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
    Meteor.publish('allFutureAvailabilitiesAndAllAppointments', function availabilitiesPublication(pastminutes) {
        return Availabilities.find(
            {
                $and: [
                    {$or: [{startDate: {$gt: new Date()}}, {bookedByConfirmed: true}]},
                    {userId: this.userId}
                ]
            },
            {sort: {startdate: -1}}
        );
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
    Meteor.publish('allFutureAppointments', function availabilitiesPublication(pastminutes) {
        return Availabilities.find({
            userId: this.userId,
            startDate: {$gt: new Date(moment().add(-pastminutes, 'm'))},
            bookedByConfirmed: true
        }, {sort: {startdate: -1}});
    });
    Meteor.publish('allAppointments', function availabilitiesPublication() {
        return Availabilities.find({userId: this.userId, bookedByConfirmed: true}, {sort: {startdate: -1}});
    });
    /**
     * These are public publications
     */
    Meteor.publish('allPublicCalendarsWithOwners', function calendarsPublication() {
        var calendarQuery = {published: true, listPublic: true};
        var calendarOptions = {fields: {_id: 1, name: 1, location: 1, linkslug: 1, userId: 1}};
        var userIds = Calendars.find({}).fetch().map(function (calendar) {
            if (calendar.listPublic){
                return calendar.userId;
            }
        });
        return [
            Calendars.find(calendarQuery,calendarOptions),
            Meteor.users.find({_id: {$in: userIds}},{fields: {"profile.name": 1}})
        ]
    });

    Meteor.publish('allPublicFutureAvailabilitiesByCalendarSlug', function availabilitiesPublication(input_calendarslug) {
        var calendar = Calendars.findOne({linkslug: input_calendarslug.toString(), published: true});
        var options = {
            fields: {startDate: 1, endDate: 1, bookedByConfirmed: 1, bookedByDate: 1, calendarId: 1},
            sort: {startdate: -1}
        };
        if (calendar !== undefined) {
            return calendarEvents = Availabilities.find({
                calendarId: calendar._id,
                startDate: {$gt: new Date()}
            }, options);
        } else {
            throw Meteor.Error("calendar-unknown")
        }
    });
    Meteor.publish('singlePublicAvailabilityById', function availabilitiesPublication(input_availabilityId) {
        var availabilityOptions = {fields: {_id: 1, startDate: 1, endDate: 1}};
        var availability = Availabilities.find({_id: input_availabilityId.toString()}, availabilityOptions);
        return availability;
    });
    Meteor.publish('singlePublicCalendarBySlug', function calendarsPublication(input_calendarSlug) {
        var calendarOptions = {fields: {_id: 1, name: 1, location: 1, linkslug: 1}};
        //Get the calendar with all of the information and save the userId
        var calendar = Calendars.findOne({linkslug: input_calendarSlug, published: true});
        var user = Meteor.users.find({_id: calendar.userId},{fields: {"profile.name": 1}});
        //Get the limited calendar
        var calendar = Calendars.find({linkslug: input_calendarSlug, published: true},calendarOptions);
        //console.log(user.profile.name);
        return [
            calendar,
            user
        ];
    });
}