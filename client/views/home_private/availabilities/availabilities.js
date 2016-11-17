var pageSession = new ReactiveDict();

Template.Availabilities.rendered = function() {

};

Template.Availabilities.events({

});

Template.Availabilities.helpers({

});

Template.Availabilities.created = function() {

};

Template.AvailabilityInsertForm.rendered = function() {


        pageSession.set("userSettingsProfileEditFormInfoMessage", "");
        pageSession.set("userSettingsProfileEditFormErrorMessage", "");

        $(".input-group.date").each(function() {
            var format = $(this).find("input[type='text']").attr("data-format");

            if(format) {
                format = format.toLowerCase();
            }
            else {
                format = "mm/dd/yyyy";
            }

            $(this).datepicker({
                autoclose: true,
                todayHighlight: true,
                todayBtn: true,
                forceParse: false,
                keyboardNavigation: false,
                format: format
            });
        });

        $("input[type='file']").fileinput();
        $("select[data-role='tagsinput']").tagsinput();
        $(".bootstrap-tagsinput").addClass("form-control");
        $("input[autofocus]").focus();
};

Template.AvailabilityInsertForm.events({
    //function is triggered by "submit" event, which is defined in the home_private.html
    "submit": function(e, t) {
        //preventDefault prevents the event e from doing what it usually does. We define event e as "mongo collection insert"
        e.preventDefault();

        //declaration of variables which gonna be inserted into collection
        var userId = Meteor.userId();
        var startDate = new Date(t.find('#startdate').value.trim());
        var endDate = new Date(t.find('#enddate').value.trim());
        var categoryId =  t.find('#categoryid').value.trim();

        //calls the function wired to 'availabilities.insert' in /imports/api/availabilitiesCollection.js
        Meteor.call('availabilities.insert', userId, startDate, endDate, categoryId);

    }
});