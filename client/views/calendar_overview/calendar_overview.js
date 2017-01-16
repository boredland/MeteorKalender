import {Calendars} from '/imports/api/calendarsCollection';
import {Meteor} from 'meteor/meteor';
var pageSession = getDefaultPageSession();

Template.CalendarOverview.onCreated(function bodyOnCreated() {

});

Template.CalendarOverview.rendered = function () {
    nullMessages(pageSession);
};

Template.CalendarOverview.helpers({
    getPageSession: function () {
        return pageSession;
    },
    settings: function () {
        return {
            collection: Calendars.find({}).fetch().map(function (calendar) {
                var user = Meteor.users.findOne({_id: calendar.userId});
                if (user && user.profile !== undefined) {
                    calendar.owner = user.profile.name;
                }
                return calendar;
            }),
            rowsPerPage: 10,
            showFilter: true,
            fields: [
                {key: 'owner', label: 'Owner'},
                {key: 'name', label: 'Name'},
                {key: 'location', label: 'Location'}
            ]
        };
    }
});


Template.CalendarOverview.events({
    'click .reactive-table tbody tr': function (e, t) {
        e.preventDefault();
        Router.go('calendar_public', {_calendarSlug: this.linkslug});
    }
});

Template.CalendarOverviewItem.helpers({
    getOwnerById(userId){
        var user = Meteor.users.findOne({_id: userId});
        if (user && user.profile !== undefined) {
            return user.profile.name;
        }
    }
});