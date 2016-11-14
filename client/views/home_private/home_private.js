import {Availabilities} from '/both/collections/availabilities'
var pageSession = new ReactiveDict();
var avail = Availabilities.find({userId:Meteor.userId()}).fetch();
Meteor.subscribe('availabilities', 'ru_RU');
Template.HomePrivate.rendered = function() {

};

Template.HomePrivate.events({
    "submit": function(e, t) {
        e.preventDefault();
        pageSession.set("availabilitiesInsertInsertFormInfoMessage", "");
        pageSession.set("availabilitiesInsertInsertFormErrorMessage", "");
        Availabilities.insert({
            userId: Meteor.userId(),
            startDate: new Date(t.find('#startdate').value.trim()),
            endDate: new Date(t.find('#enddate').value.trim()),
            categoryId: t.find('#categoryid').value.trim()
        });
    }
});

Template.HomePrivate.helpers({
    "infoMessage": function() {
        return pageSession.get("availabilitiesInsertInsertFormInfoMessage");
    },
    "errorMessage": function() {
        return pageSession.get("availabilitiesInsertInsertFormErrorMessage");
    },
    availabilities(){
        return avail;
    }
});
