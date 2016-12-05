var pageSession = new ReactiveDict();
import {Availabilities} from '/imports/api/availabilitiesCollection';
import { Meteor } from 'meteor/meteor';


Template.CalendarPublic.onCreated(function bodyOnCreated() {
    }
);

Template.CalendarPublic.rendered = function() {
    var calendarPublicToken = Router.current().params.calendarPublicToken;
    //Meteor.subscribe('publicCalendar', calendarPublicToken)
    Meteor.subscribe('calendarAvailabilities', calendarPublicToken);
    pageSession.set("errorMessage", "");
};

Template.CalendarPublic.events({

});

Template.CalendarPublic.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  },
  getCalendarAvailabilities(){
    return Availabilities.find();
  }
});
