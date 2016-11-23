/**
 * Created by tobi on 23.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check'
import {calendarSchema} from './calendarSchema'

export const Calendars = new Mongo.Collection("calendars");
Calendars.attachSchema(calendarSchema);

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allCalendars', function calendarPublication() {
        return Calendars.find();
    });
}

Meteor.methods({
    'calendars.insert'() {

        //if user doesnt have an ID (not logged in), he is not allowed to perform that action.
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        //finally, data are inserted into the collection
        Calendars.insert({

        });
    },

    'calendars.remove'(){
        //check whether the ID which should be deleted is a String

        //Calendars.remove();

    }
});