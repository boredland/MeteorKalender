import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
var pageSession = getDefaultPageSession();

Template.CalendarOverview.onCreated(function bodyOnCreated() {

});

Template.CalendarOverview.rendered = function() {
    nullMessages(pageSession);
};

Template.CalendarOverview.events({

});

Template.CalendarOverview.helpers({
    getCalendars(){
        return Calendars.find();
    },
    getPageSession: function () {
        return pageSession;
    }
});