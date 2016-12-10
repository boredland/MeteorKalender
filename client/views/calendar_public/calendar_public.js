var pageSession = new ReactiveDict();
var calendar,availabilities;

function getEvents(){
    let data = "bla";
    return data;
}
function dataReady() {
    if (availabilities && calendar){
        return true
    } else {
        return false
    }
}

Template.CalendarPublic.onCreated(function bodyOnCreated() {
    calendar = this.data[0];
    availabilities = this.data[1];
});

Template.CalendarPublic.rendered = function() {

};

Template.CalendarPublic.events({

});

Template.CalendarPublic.helpers({
    itemsReady:function() {
        if (availabilities && calendar){
            return true
        } else {
            return false
        }
    },
  "errorMessage": function() {
    return pageSession.get("errorMessage");
  },
  CurrentCalendarName() {
      return calendar.name;
  },
  publicCalendarOptions: {
        // Standard fullcalendar options
        //editable: true,
        defaultView: 'listWeek',
        //hiddenDays: [ 0 ],
        //slotDuration: '00:05:00',
        //minTime: '08:00:00',
        //maxTime: '21:00:00',
        lang: 'de',
        // Function providing events reactive computation for fullcalendar plugin
        events( start, end, timezone, callback ) {
            if (dataReady()){
                let data = availabilities;
                if ( data ) {
                    callback( data );
                }
            }
        },
        // Optional: id of the calendar
        id: "publicCalendar",
        // Optional: Additional classes to apply to the calendar
        //addedClasses: "col-md-8",
        // Optional: Additional functions to apply after each reactive events computation
        //    autoruns: [
        //    function () {
        //        console.log("user defined autorun function executed!");
        //    }
        //]
        eventClick: function(calEvent, jsEvent, view) {
          if (calEvent.start > moment()){
              Router.go("calendar_public.book",{_availabilityId: calEvent.id, _calendarSlug: Router.current().params._calendarSlug});
          }
        }
    }
});
