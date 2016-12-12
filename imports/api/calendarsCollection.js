/**
 * Created by tobi on 23.11.16.
 */

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {calendarsSchema} from './calendarsSchema';
import {} from "/imports/api/collectionPublications";
import {Availabilities} from '/imports/api/availabilitiesCollection';

export const Calendars = new Mongo.Collection("calendars");
Calendars.attachSchema(calendarsSchema);

if (Meteor.isServer) {

};

Calendars.allow({
    insert: function (name,location,color,published) {
        return true; // is there some meaningful check we could use?
    },
    update: function(name, location,color,published) {
        return true;
    }
});

Meteor.methods({
     'calendars.insert'(doc) {
        console.log("insertCalendar run");
        //if user doesnt have an ID (not logged in), he is not allowed to perform that action.
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        //finally, data are inserted into the collection
        Calendars.insert({
            userId: this.userId,
            name: doc.name,
            location: doc.location,
            color: doc.color,
            published: doc.published,
            linkslug: doc.linkslug
        });
    },

    'calendars.remove'(calendarId){
        //check whether the ID which should be deleted is a String
        check(calendarId, String);
        //check that there are no future availabilities
        checkNoFutureAvailabilities(calendarId);
        //check whether the user is authorized to delete the task.
        const toBeDeleted = Calendars.findOne(calendarId);
        if (this.userId !== toBeDeleted.userId){
            throw new Meteor.Error('not-authorized');
        }
        Calendars.remove(calendarId);

    },
});

var checkNoFutureAvailabilities = function (calendarId){
    var futurecount = 0;
    Meteor.subscribe('allFutureAvailabilities', function() {
        futurecount = Availabilities.find({calendarId: calendarId.toString()}).count();
    });
    if (futurecount >0){
        throw new Meteor.Error("This calendar has "+futurecount+" availabilities");
    }
};