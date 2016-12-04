this.EditCalendarController = RouteController.extend({
    template: "EditCalendar",

    onBeforeAction: function() {
        this.next();
    },

    action: function() {
        this.render("HomePrivate");
        if(this.isReady()) { this.render("EditCalendar", { to: "HomePrivateSubcontent"}); } else { this.render("HomePrivate"); this.render("loading", { to: "HomePrivateSubcontent" });}
        /*ACTION_FUNCTION*/
    },

    isReady: function() {


        var subs = [
        ];
        var ready = true;
        _.each(subs, function(sub) {
            if(!sub.ready())
                ready = false;
        });
        return ready;
    },

    data: function() {


        var data = {
            params: this.params || {}
        };




        return data;
    },

    onAfterAction: function() {

    }
});
