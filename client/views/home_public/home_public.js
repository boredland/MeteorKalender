import {TestCollection} from '/both/collections/testcollection'
var elementtest = TestCollection.findOne();
var coll = TestCollection.find().fetch();

Template.HomePublic.rendered = function() {

};

Template.HomePublic.helpers({
    tasks(){
        console.log(elementtest.text);
        return elementtest.text;
    },
    taskiter(){
        return coll;
    }
});
