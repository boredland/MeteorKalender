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
        console.log("created Index over calenderID in Availabilities Collection");
    }
});

if (Meteor.isServer) {
    /**
     * This will check that there are no Availabilities for this user at the same time or overlapping times.
     */
    Availabilities.before.insert(function (userId, doc) {
        var new_startdate = new Date(doc.startDate);
        var new_enddate = new Date(doc.endDate);
        Availabilities.find({},{userId: doc.userId, startDate: {$gt: new Date()}}).fetch().map( ( availability ) => {
            if (availability !== undefined) {
                var existing_startdate = new Date(availability.startDate);
                var existing_enddate = new Date(availability.endDate);
                //console.log("Are " + new_startdate + " or "+new_enddate+" between " + existing_startdate + " or " + existing_enddate + "?");
                if (
                    (
                        (existing_startdate <= new_startdate )&& (new_startdate <= existing_enddate)
                    ) ||
                    (
                        (existing_startdate <= new_enddate) && (new_enddate <= existing_enddate)
                    ) ||
                    (
                        (new_startdate <= existing_startdate) && (new_enddate >= existing_enddate)
                    )
                ) {
                    throw new Meteor.Error("overlap");
                }
            }
            return true;
        });
    });
    /**
     * Checks vor dem Löschvorgang
     * Hier sollte geprüft werden, dass nichts mit buchungsmerkmalen gelöscht wird.
     */
    Availabilities.before.remove(function (userId, doc) {
        var availability = Availabilities.findOne({_id: doc._id});
        if (availability.bookedByConfirmed){
            throw Meteor.Error("booked","This availibility is booked and therefor only can be cancelled.")
        }
        if (!availability.bookedByConfirmed && availability.bookedByDate && (moment(availability.bookedByDate) > moment().add(-10,'m'))){
            throw Meteor.Error("reserved","This availibility is reserved and therefor only can be cancelled.")
        }
    });
    /**
     *     Hier sollten Methoden landen, die nur auf dem server laufen sollten.
     */
    Meteor.methods({
        /**
         * Erstellt eine Buchung.
         * @param doc
         */
        'booking.insert'(doc){
            //generate our random verification token
            var verificationToken = Random.id();
            // generate our random cancellation-token
            var cancellationToken = Random.id();
            // Send Mails if the insertion was successful.
            Availabilities.update(doc.availabilityId, {
                $set: {
                    bookedByEmail: doc.bookedByEmail,
                    bookedByName: doc.bookedByName,
                    bookedByReserved: true,
                    bookedByConfirmed: false,
                    bookedByDate: new Date(),
                    bookedByConfirmationToken: verificationToken,
                    bookedByCancellationToken: cancellationToken
                },
            });
            var availability = Availabilities.findOne({bookedByConfirmed: false},{bookedByConfirmationToken: verificationToken});
            // check if the availability is in the database.
            if (availability != undefined){
                // Let other method calls from the same client start running,
                // without waiting for the email sending to complete.
                this.unblock();
                Email.send({
                    to: doc.bookedByEmail,
                    from: "no-reply@meteor.com",
                    subject: "Your reservation at MeteorKalender needs your confirmation.",
                    text: "Thank you for your reservation at MeteorKalender. We need you to click at the following link to activate your booking: " +
                    Meteor.absoluteUrl()+"verify_booking/"+verificationToken
                });
                return true;
            } else {
                throw new Meteor.Error('booking-error',"There was an error saving your booking information.");
            }
        },
        /**
         * setzt eine Availability auf "booking confirmed".
         * @param availabilityId ID der Availability
         */
        'booking.confirm'(verifyBookingToken){
            var availability = Availabilities.findOne({bookedByConfirmed: false, bookedByConfirmationToken: verifyBookingToken},{});
            if (availability != undefined){
                console.log("booking confirmed")
                return Availabilities.update(availability._id,{$set: {bookedByConfirmed: true}});
                //-> Here the user should get a mail about his reservation beeing confirmed and the cancellation-link.
            } else {
                throw new Meteor.Error('confirmation-error',"There was an error confirming your activation. Either your token has not been found or you've already confirmed your booking.");
            }
        }
    });
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
        var startTime = moment(doc.startDate).hour(moment(doc.startTime).get('hour')).minute(moment(doc.startTime).get('minute')).seconds(0);
        var endTime = moment(doc.startDate).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute')).seconds(0);
        var repeatUntil = moment(doc.repeatUntil).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute'));
        var familyid = Random.id().substring(0, 4);

        checkInsertionConditions(startTime, endTime, doc, this.userId)
        var startTimeModified = startTime;
        var endTimeModified = endTime;
        var overlapErrorCount = 0;
        do {
            var chunkEndTime = startTimeModified;
            if ((!isThisBankHoliday(startTimeModified) && (doc.dontSkipHolidays == false)) || doc.dontSkipHolidays == true) {
                // this is for the chunks
                do {
                    var chunkStartTime = chunkEndTime;
                    chunkEndTime = moment(chunkEndTime).add(doc.chunkDuration, 'm');
                    try {
                        insertAvailability(this.userId, new Date(chunkStartTime.seconds(1)), new Date(chunkEndTime.seconds(0)), doc.calendarId, familyid);
                    } catch(err) {
                        if (err.error === "overlap") {
                            overlapErrorCount++;
                        }
                    }
                } while (chunkEndTime < endTimeModified);
            }
            startTimeModified.add(doc.repeatInterval, 'w');
            endTimeModified.add(doc.repeatInterval, 'w');
            //console.log("repeatinterval: ",doc.repeatInterval);
        } while (startTimeModified <= repeatUntil && doc.repeatInterval != undefined);
        if (overlapErrorCount > 0) {
            throw new Meteor.Error('overlap',overlapErrorCount+" overlapping availabilities skipped.");
        }
    },
    /**
     * Löscht eine Availability.
     * @param availabilityID
     */
    'availabilities.remove'(availabilityID){
        //check ob availability gebucht?
        //check whether the ID which should be deleted is a String
        check(availabilityID, String);

        //check whether the user is authorized to delete the task.
        const toBeDeleted = Availabilities.findOne(availabilityID);
        if (this.userId !== toBeDeleted.userId) {
            throw new Meteor.Error('not-authorized');
        }
        return Availabilities.remove(availabilityID);
    },

    /**
     * Löscht alle zukünftigen Availabilities des gegenwärtigen Benutzers, die weder reserviert, noch gebucht sind.
     * @param availabilities.removeall
     */
    'availabilities.removeAll'(){
        // loescht alle, die kein bookedByDate gesetzt haben.
        Availabilities.remove({userId: this.userId, bookedByDate: undefined});
        // loescht alle mit abgelaufenen reservierungen.
        Availabilities.remove({userId: this.userId, bookedByDate: {$lt: new Date(moment().add(-10,'m'))}, bookedByConfirmed: false});
        // Rückgabewert mit der Anzahl verbliebener Availibilities, könnte man bspw. in einem Info-Feld ausgeben. Die Anzal gelöschter könnte man auch ausgeben if you want.
        return Availabilities.find({userID: this.userID},{bookedByDate: {$lt: new Date(moment().add(-10,'m'))}}).count();
    },
    /**
     * Löscht alle Availabilities der gleichen Family.
     * @param availabilityId. Anhand dieser AvailabilityId wird die Family der Availability gelöscht
     */
    'availabilities.removebyFamilyID'(availabilityId){
        check(availabilityId, String);

        var deletethis = Availabilities.findOne(availabilityId);
        if (this.userId !== deletethis.userId) {
            throw new Meteor.Error('not-authorized');
        }

        var familyId = Availabilities.findOne(availabilityId).familyId;
        console.log("deleting " + Availabilities.find({familyId: familyId}).count() + " availabilities")


        var storeReservedAvailabilities = [];
        //Speichert alle reservierten Availabilities zwischen
        Availabilities.find({familyId: familyId, bookedByReserved: true}).forEach(
            function(element){
                storeReservedAvailabilities.push(element)
            }
        )

        Availabilities.remove({familyId: familyId})

        //Schreibe die zwischengespeicherten Availabilities wieder in die DB
        storeReservedAvailabilities.forEach(
            function(element){
                Availabilities.insert(element)
            }
        )

    },
    /**
     * Löscht alle Availabilities der family des gegenwärtigen Benutzers.
     * @param availabilities.removebyChunkID
     */
    'availabilities.removebySiblingID'(availabilityId){
        var familyId = Availabilities.findOne(availabilityId).familyId;
        var siblingStartTime = Availabilities.findOne(availabilityId).startDate;

        var storeReservedAvailabilities = [];
        //Speichert alle reservierten Availabilities zwischen
        Availabilities.find({familyId: familyId, bookedByReserved: true, startDate: siblingStartTime}).forEach(
            function(element){
                storeReservedAvailabilities.push(element)
            }
        )
        Availabilities.remove({familyId: familyId, startDate: siblingStartTime})

        //Schreibe die zwischengespeicherten Availabilities wieder in die DB
        storeReservedAvailabilities.forEach(
            function(element){
                Availabilities.insert(element)
            }
        )
    },
    /**
     * Setzt die Buchung zurück
     * @param availabilityID
     */
    'booking.cancel'(availabilityId){
        return Availabilities.update({_id: availabilityId},{
            $set: {
                bookedByName: null,
                bookedByDate: null,
                bookedByEmail: null,
                bookedByConfirmed: false,
            }
        });
    },
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
    return Availabilities.insert({
        userId: thisUserId,
        startDate: startDate,
        endDate: endDate,
        calendarId: calendarID,
        familyId: familyId,
    });
}
