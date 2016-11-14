import {TestCollection} from '/both/collections/testcollection'

Template.HomePublic.rendered = function() {

};
var elementtest = TestCollection.findOne();

Template.HomePublic.helpers({
    tasks(){
        console.log(elementtest.text);
        return elementtest.text;
    }
});
