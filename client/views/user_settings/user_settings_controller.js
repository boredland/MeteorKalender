this.UserSettingsController = RouteController.extend({
    template: "UserSettings",


    yieldTemplates: {
		/*YIELD_TEMPLATES*/
    },

    action: function() {
        if(this.isReady()) { this.render(); } else { this.render("loading"); }
		/*ACTION_FUNCTION*/
    },

    isReady: function() {
        var subs = [
            Meteor.subscribe("current_user_data")
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
            params: this.params || {},
            current_user_data: Users.findOne({_id:Meteor.userId()}, {})
        };
        return data;
    },

    onAfterAction: function() {

    }
});