/**
 * Created by tobi on 15.11.16.
 */
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {availabilitiesSchema} from "./availabilitiesSchema";
import feiertagejs from "feiertagejs";

export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

Meteor.startup(function () {
    if (Meteor.isServer) {
        Availabilities._ensureIndex({"calendarID": 1})
        console.log("created Index over calenderID in Availabilities Colleciton")
    }
})

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allAvailabilities', function availabilitiesPublication() {
        return Availabilities.find({userId: this.userId}, {sort: {startdate: -1}});
    });
    Meteor.publish('allFutureAvailabilities', function availabilitiesPublication() {
        return Availabilities.find({userId: this.userId, startDate: {$gt: new Date()}}, {sort: {startdate: -1}});
    });
    Meteor.publish('allPublicFutureAvailabilitiesByCalendarId', function availabilitiesPublication(input_calendarid) {
        var options = {fields: {startDate: 1, endDate: 1}, sort: {startdate: -1}};
        var calendarEvents = Availabilities.find({calendarId: input_calendarid, startDate: {$gt: new Date()}}, options);
        return calendarEvents;
    });
    Meteor.publish('singlePublicAvailabilityById', function availabilitiesPublication(input_availabilityId) {
        var availabilityOptions = {fields: {_id: 1, startDate: 1, endDate: 1}};
        var availability = Availabilities.find({_id: input_availabilityId.toString()}, availabilityOptions);
        return availability;
    });
}
;

// it is best practice to explicitly allow crud-actions
Availabilities.allow({
    insert: function (endTime, repeatInterval, repeatUntil, startDate, startTime) {
        return true; // is there some meaningful check we could use?
    },
    update: function (startDate, endDate, calendarId, userId) {
        return true;
    }
});

//methods can be called in every .js file which has "import { Meteor } from 'meteor/meteor';" .
Meteor.methods({
    'availabilities.insert'(doc) {
        //console.log(doc);
        var startTime = moment(doc.startDate).hour(moment(doc.startTime).get('hour')).minute(moment(doc.startTime).get('minute'));
        var endTime = moment(doc.startDate).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute'));
        var repeatUntil = moment(doc.repeatUntil).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute'));
        var familyid = Random.id().substring(0, 4);

        checkInsertionConditions(startTime, endTime, doc, this.userId)

        var startTimeModified = startTime;
        var endTimeModified = endTime;
        do {
            var chunkEndTime = startTimeModified;
            if ((!isThisBankHoliday(startTimeModified) && (doc.dontSkipHolidays == false)) || doc.dontSkipHolidays == true) {
                do {
                    chunkStartTime = chunkEndTime;
                    chunkEndTime = moment(chunkEndTime).add(doc.chunkDuration, 'm');
                    insertAvailability(this.userId, chunkStartTime._d, chunkEndTime._d, doc.calendarId, familyid)
                } while (chunkEndTime < endTimeModified);
            }
            startTimeModified.add(doc.repeatInterval, 'w')
            endTimeModified.add(doc.repeatInterval, 'w')
        } while (startTimeModified <= repeatUntil && repeatUntil != 0)

    },
    'availabilities.remove'(availabilityID){
        //check whether the ID which should be deleted is a String
        check(availabilityID, String);

        //check whether the user is authorized to delete the task.
        const toBeDeleted = Availabilities.findOne(availabilityID);
        if (this.userId !== toBeDeleted.userId) {
            throw new Meteor.Error('not-authorized');
        }
        Availabilities.remove(availabilityID);

    },
    'booking.insert'(doc){
        /**
         * Add a check here if the item is without booking or booking unconfirmed and older than 10 minutes
         * this additionally could be the place to send the confirmation-mail.
         */
        console.log(doc);
        Availabilities.update(doc.availabilityId, {
            $set: {
                bookedByDate: this.bookedByDate,
                bookedByEmail: this.bookedByEmail,
                bookedByName: this.bookedByName,
            },
        });
    }
});

var isThisBankHoliday = function (date) {
    return feiertagejs.isHoliday(new Date(date), 'HE');
}
/**
 * Funktion checkt ob die Daten für den Insert ok sind
 * @param startTime
 * @param endTime
 * @param doc
 * @param thisUserId
 */
var checkInsertionConditions = function (startTime, endTime, doc, thisUserId) {
    var duration = Math.round((moment(doc.endTime) - moment(doc.startTime)) / (1000 * 60));
    if (startTime > endTime) {
        throw new EvalError("Startdate: " + startTime + " is bigger than Enddate " + endTime);
    }
    if (duration < doc.chunkDuration) {
        throw new EvalError("Duration " + duration + " is shorter than Chunkperiod " + doc.chunkDuration);
    }
    if (!thisUserId) {
        throw new Meteor.Error('not-authorized');
    }
}

/**
 * Funktion fügt Daten in die MongoDB Collection ein.
 * @param thisUserId
 * @param startDate
 * @param endDate
 * @param calendarID
 * @param familyId
 */
var insertAvailability = function (thisUserId, startDate, endDate, calendarID, familyId) {

    Availabilities.insert({
        userId: thisUserId,
        startDate: startDate,
        endDate: endDate,
        calendarId: calendarID,
        familyId: familyId,
    });
}
