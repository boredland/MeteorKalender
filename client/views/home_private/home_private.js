
Template.HomePrivate.rendered = function() {

};

///imports/api/availabilitiesCollection.js "publishes" the collection which is "subscribed" in this step. This way we can "use" the collection on the client.
Template.HomePrivate.onCreated(function bodyOnCreated() {
    Meteor.subscribe('allAvailabilities');
});


Template.HomePrivate.events({

});

//function is called within home_private.html
Template.HomePrivate.helpers({

});

Template.HomePrivateSideMenu.rendered = function() {
    $(".menu-item-collapse .dropdown-toggle").each(function() {
        if($(this).find("li.active")) {
            $(this).removeClass("collapsed");
        }
        $(this).parent().find(".collapse").each(function() {
            if($(this).find("li.active").length) {
                $(this).addClass("in");
            }
        });
    });

};

Template.HomePrivateSideMenu.events({
    "click .toggle-text": function(e, t) {
        e.preventDefault();
        $(e.target).closest("ul").toggleClass("menu-hide-text");
    }

});

Template.HomePrivateSideMenu.helpers({

});