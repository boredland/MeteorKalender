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
        var startdate = moment(doc.startDate).hour(moment(doc.startTime).get('hour')).minute(moment(doc.startTime).get('minute'));
        var enddate = moment(doc.startDate).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute'));
        var chunkarray = [];
        var familyId = Random.id().substring(0,4);

        if (! this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // get an repetitionarray for the single interval
        var getRepetitionArrayForPeriod = function (startdate,enddate,interval,until){
            var datearray = [];
            do {
                datearray.push({start: startdate, end: enddate});
                startdate = moment(startdate).add(interval,'w');
                enddate = moment(enddate).add(interval,'w');
            } while (enddate < until);
            return datearray;
        }

        // create the chunks for the first period and their repetitions.
        if (doc.chunkPeriod > 0) {
            var current = startdate;
            var counter=0;
            do {
                //console.log(current._d);
                last = current;
                current = moment(current).add(doc.chunkPeriod,'m');
                chunkarray.push(getRepetitionArrayForPeriod(last,current,doc.repeatInterval,doc.repeatUntil));
            } while (current < enddate);
        } else if (doc.chunkPeriod = 0) {
            chunkarray = [{start:startdate,end:enddate}];
        }

        // I think we wont need that, it's only to demonstrate how we can prepare (and reduce) the data preprocessing. Do we need that sorted?
        var subarray = [];
        var i,j = 0;
        var flatarray = [];
        for (i=0;i<chunkarray.length;i++){
            subarray = chunkarray[i];
            for (j=0;j<subarray.length;j++){
                    flatarray.push({start: subarray[j].start, end: subarray[j].end});
            }
        }
        console.log("That is what is in our flat array now: ")
        for (i=0;i<flatarray.length;i++){
            console.log("Startdate: "+flatarray[i].start._d+" till Enddate: "+flatarray[i].end._d);
            Availabilities.insert({
                userId: this.userId,
                startDate: flatarray[i].start._d,
                endTime: flatarray[i].end._d,
                calendarId: doc.calendarId,
            });
        }
        /*
        var checkLegalHolidays = function (date) {
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
            return true;
        };*/
/*
        if (doc.legalHolidays) {
            console.log("calculate legal holidays..");
            checkLegalHolidays(doc.startDate); //only for the startdate right now...
        }*/

        //finally, data gets inserted into the collection
        /*Availabilities.insert({
            userId: this.userId,
            startDate: doc.startDate,
            startTime: doc.startTime,
            endTime: doc.endTime,
            calendarId: doc.calendarId,
        });*/
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