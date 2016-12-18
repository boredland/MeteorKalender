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
    /**
     * This collection hook will check that no Calendar can be deleted that still contains elements in the future.
     */
    Calendars.before.remove((userId,doc) => {
        if (Availabilities.findOne({startDate: {$gt: new Date()},calendarId: doc._id})){
            throw new Meteor.Error('notEmpty', "Can't delete a calendar that contains future availabilities.");
        } else {
            return true;
        }
    });
    // Server-side methods
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
            Calendars.remove({_id: calendarId, userId: this.userId});
        },
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
