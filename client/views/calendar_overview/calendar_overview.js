import {Calendars} from '/imports/api/calendarsCollection';
import { Meteor } from 'meteor/meteor';
var pageSession = getDefaultPageSession();

Template.CalendarOverview.onCreated(function bodyOnCreated() {

});

Template.CalendarOverview.rendered = function() {
    nullMessages(pageSession);
};

Template.CalendarOverview.helpers({
    getCalendars(){
        return Calendars.find();
    },
    getPageSession: function () {
        return pageSession;
    }
});


Template.CalendarOverview.events({
    'click #dataview-table-items-row': function(e, t) {
        e.preventDefault();
        Router.go('calendar_public',{_calendarSlug: this.linkslug});
    }
});

Template.CalendarOverviewItem.helpers({
    getOwnerById(userId){
        var user = Meteor.users.findOne({_id: userId});
        if (user && user.profile !== undefined){
            return user.profile.name;
        }
    }
});