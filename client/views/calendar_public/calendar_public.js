var pageSession = new ReactiveDict();
import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

Template.CalendarPublic.onCreated(function bodyOnCreated() {
    pageSession.set("errorMessage", "");
});

Template.CalendarPublic.rendered = function() {

};

Template.CalendarPublic.events({

});

Template.CalendarPublic.helpers({
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  },
  CurrentCalendarName() {
      return Calendars.findOne({}).name;
  },
  publicCalendarOptions: function(){
      return getCalendarOptions(getCalendarEvents(Availabilities.find({}),Calendars,false),pageSession);
  }
});
