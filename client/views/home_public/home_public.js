Template.HomePublic.rendered = function() {

};

Template.HomePublic.onCreated(function bodyOnCreated() {

});

Template.HomePublic.helpers({
    isAndroid: function () {
        return navigator.userAgent.toLowerCase().indexOf("android") > -1;
    }
});