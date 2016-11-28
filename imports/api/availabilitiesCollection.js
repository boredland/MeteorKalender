/**
 * Created by tobi on 15.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {availabilitiesSchema} from './availabilitiesSchema';

export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allAvailabilities', function availabilitiesPublication() {
        return Availabilities.find();
    });
};

// it is best practise to explicitly allow crud-actions
Availabilities.allow({
    insert: function (startDate, endTime, calendarId, bookFrom, bookUntil, repeatInterval, repeatUntil) {
        return true; // is there some meaningful check we could use?
    }
});

//methods can be called in every .js file which has "import { Meteor } from 'meteor/meteor';" .
Meteor.methods({
    insertAvailability: function(doc) {
        var checklegalholidays = function (startDate) {
            HTTP.call( 'GET', 'http://cors.io/?http://feiertage.jarmedia.de/api/?jahr=2016&nur_land=HE', {}, function( error, response ) {
                if ( error ) {
                    console.log( error );
                } else {
                    console.log(JSON.parse(response.content));
                    if (JSON.parse(response.content)){ //not ready yet.
                        return true;
                    } else if (!JSON.parse(response.content)){
                        return true;
                    }
                }
            });
        };
        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        if (doc.legalHolidays) {
            console.log("calculate legal holidays..");
            checklegalholidays(doc.startDate); //only for the startdate right now...
        }

        if (doc.chunkPeriod) {
            console.log("calculate the chunks with a duration of "+doc.chunkPeriod)
        }

        if (doc.repeatInterval>0) {
            console.log("calculate repetition-date for interval"+doc.repeatInterval)
        }

        if (doc.repeatUntil){
        }

        //finally, data are inserted into the collection
        Availabilities.insert({
            userId: this.userId,
            startDate: doc.startDate,
            endTime: doc.endTime,
            calendarId: doc.calendarId,
        });
        var insertedAvailabilityID = Availabilities.findOne({userId: this.userId, startDate: doc.startDate, endTime: doc.endTime})._id
        Meteor.call('calendars.addAvailability', doc.calendarId, insertedAvailabilityID);
        console.log("called insertAvailability")
    },

    'availabilities.remove'(availabilityID){
        //check whether the ID which should be deleted is a String
        check(availabilityID, String);

        //check whether the user is authorized to delete the task.
        const toBeDeleted = Availabilities.findOne(availabilityID);
        if (this.userId !== toBeDeleted.userId){
            throw new Meteor.Error('not-authorized');
        }
        Availabilities.remove(availabilityID);

    }
});