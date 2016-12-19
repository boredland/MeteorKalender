var pageSession = getDefaultPageSession();
import {Availabilities} from '/imports/api/availabilitiesCollection';
import {Calendars} from '/imports/api/calendarsCollection';

Template.CalendarPublic.helpers({
  CurrentCalendarName() {
      return Calendars.findOne({}).name;
  },
  publicCalendarOptions: function(){
      return getCalendarOptions(getCalendarEvents(Availabilities.find({}),Calendars,false),pageSession);
  }
});
