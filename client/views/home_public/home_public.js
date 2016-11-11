import {Test} from '../../../both/collections/test'

Template.HomePublic.rendered = function() {
	
};

Template.HomePublic.events({
	
});

//noinspection JSAnnotator,JSAnnotator
Template.HomePublic.helpers({
    tasks(){
        //alert(Test.find().count()) //Anhand der Zeile Sieht man das die Einträge in der Collection "verschiwinden"
        return Test.find({});
    }
});
