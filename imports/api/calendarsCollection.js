/**
 * Created by tobi on 23.11.16.
 */

import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {calendarsSchema} from './calendarsSchema';
export const Calendars = new Mongo.Collection("calendars");
Calendars.attachSchema(calendarsSchema);

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allCalendars', function calendarsPublication() {
        return Calendars.find({userId: this.userId});
    });
    Meteor.publish('singleCalendar', function calendarsPublication(input_calendarId) {
        var calendar = Calendars.find({_id: input_calendarId, userId: this.userId});
        return calendar;
    });
    Meteor.publish('singlePublicCalendarBySlug', function calendarsPublication(input_calendarSlug) {
        var calendarOptions = {fields: {_id: 1, name: 1, location: 1,linkslug: 1}};
        var calendar = Calendars.find({linkslug: input_calendarSlug},calendarOptions);
        return calendar;
    });
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

        //Calendars.remove();
        //check whether the ID which should be deleted is a String
        check(calendarId, String);

        //check whether the user is authorized to delete the task.
        const toBeDeleted = Calendars.findOne(calendarId);
        if (this.userId !== toBeDeleted.userId){
            throw new Meteor.Error('not-authorized');
        }
        Calendars.remove(calendarId);

    },
});