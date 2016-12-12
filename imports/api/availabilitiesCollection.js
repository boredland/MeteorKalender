/**
 * Created by tobi on 15.11.16.
 */
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {availabilitiesSchema} from "./availabilitiesSchema";
import feiertagejs from "feiertagejs";
import {} from "/imports/api/collectionPublications";

export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

Meteor.startup(function () {
    if (Meteor.isServer) {
        Availabilities._ensureIndex({"calendarID": 1})
        console.log("created Index over calenderID in Availabilities Colleciton")
    }
});

if (Meteor.isServer) {

};

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
    /**
     * Fügt Availabilities ein. Dabei werden die Availabilities entsprechend der Inputwerte geteilt und einzeln eingefügt.
     * Alle Availabilities die in einem aufruf erstellt werden, bekommen die selbe familyId zugewiesen.
     * @param doc
     */
    'availabilities.insert'(doc) {
        //console.log(doc);
        var startTime = moment(doc.startDate).hour(moment(doc.startTime).get('hour')).minute(moment(doc.startTime).get('minute')).set(0,'s');
        var endTime = moment(doc.startDate).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute')).set(0,'s');
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
        } while (startTimeModified <= repeatUntil)

    },
    /**
     * Löscht eine Availability.
     * @param availabilityID
     */
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
    /**
     * Erstellt eine Buchung.
     * @param doc
     */
    'booking.insert'(doc){
        //check whether the ID which should be deleted is a String
        /**
         * Add a check here if the item is without booking or booking unconfirmed and older than 10 minutes
         */


        Availabilities.update(doc.availabilityId, {
            $set: {
                bookedByEmail: doc.bookedByEmail,
                bookedByName: doc.bookedByName,
                bookedByConfirmed: true, //should be false later.
                bookedByDate: new Date(),
            },
        });

        console.log(doc);

    },
    /**
     * setzt eine Availability auf "booking confirmed".
     * @param availabilityId ID der Availability
     */
    'booking.confirm'(availabilityId){
        Availabilities.update(availabilityId,{$set: {bookedByConfirmed: true}})
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
