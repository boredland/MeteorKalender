/**
 * Created by tobi on 15.11.16.
 */
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {availabilitiesSchema} from "./availabilitiesSchema";
import feiertagejs from "feiertagejs";
import {} from "/imports/api/collectionPublications";
import {Calendars} from '/imports/api/calendarsCollection';

export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

Meteor.startup(function () {
    if (Meteor.isServer) {
        Availabilities._ensureIndex({"calendarID": 1})
        console.log("created Index over calenderID in Availabilities Collection");
    }
});

if (Meteor.isServer) {
    var reservationThreshold = 10; // Minutes before a reservation invalidates
    var sendMail = function (options) {
        return Meteor.call('sendMail',options);
    };

    /**
     * Überprüft, ob es sich um einen Feiertag handelt.
     * @param date
     * @returns {*|boolean}
     */
    var isThisBankHoliday = function (date) {
        return feiertagejs.isHoliday(new Date(date), 'HE');
    };

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
    };
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
            throw Meteor.Error("is-booked","This availibility is booked and therefor only can be cancelled.")
        }
        if (!availability.bookedByConfirmed && availability.bookedByDate && (moment(availability.bookedByDate) > moment().add(-reservationThreshold,'m'))){
            throw Meteor.Error("is-reserved","This availibility is reserved and therefor only can be cancelled.")
        }
    });
    /**
     *     Hier sollten Methoden landen, die nur auf dem server laufen sollten.
     */
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
         * Erstellt eine Buchung.
         * @param doc
         */
        'booking.insert'(doc){
            // check if this has an peding active reservation
            if (Availabilities.findOne({_id: doc.availabilityId, bookedByDate: {$gt: new Date(moment().add(-reservationThreshold,'m'))}})){
                throw new Meteor.Error("pending-reservation","This availability has a pending reservation and therefor can't be reserved at this point. How did you even get here?")
            };
            //generate our random verification token
            var verificationToken = Random.id();
            // generate our random cancellation-token
            var cancellationToken = Random.id();
            Availabilities.update(doc.availabilityId, {
                $set: {
                    bookedByEmail: doc.bookedByEmail,
                    bookedByName: doc.bookedByName,
                    bookedByReserved: true, // das ist voll fürn arsch.
                    bookedByConfirmed: false,
                    bookedByDate: new Date(),
                    bookedByConfirmationToken: verificationToken,
                    bookedByCancellationToken: cancellationToken
                },
            });
            // Send Mails if the insertion was successful.
            // check if the availability is in the database.
            availability = Availabilities.findOne({bookedByConfirmed: false, bookedByConfirmationToken: verificationToken});
            if (availability != undefined){
                this.unblock();
                sendMail({
                    to: doc.bookedByEmail,
                    subject: "Your reservation needs confirmation",
                    text: "Hello "+doc.bookedByName+",\n"+
                    "Thank you for your reservation at MeteorKalender. \n" +
                    "We need you to click at the following link to activate your booking: \n" +
                    Meteor.absoluteUrl()+"verify_booking/"+verificationToken +"\n"
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
            var currentAvailability = Availabilities.findOne({bookedByConfirmed: false, bookedByConfirmationToken: verifyBookingToken},{});
            if (currentAvailability != undefined){
                console.log("booking confirmed")
                return Availabilities.update(currentAvailability._id,{$set: {bookedByConfirmed: true, bookedByConfirmationToken: null}},function () {
                    sendMail({
                        to: currentAvailability.bookedByEmail,
                        subject: "You have a date with your professor!",
                        text: "Hello "+currentAvailability.bookedByName+",\n"+
                        "your booking for CALENDARNAME from "+currentAvailability.startDate+" to "+currentAvailability.endDate+" has been confirmed. \n" +
                        "If you'd like to cancel the meeting, you'll have to click at the following link: "+
                        Meteor.absoluteUrl()+"cancel_booking/"+currentAvailability.bookedByCancellationToken
                    });
                });
            } else {
                throw new Meteor.Error('confirmation-error',"There was an error confirming your activation. Either your token has not been found or you've already confirmed your booking.");
            }
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
                    bookedByCancellationToken: null,
                }
            });
        },
        /**
         * Methode um eine Buchung anhand des Stornierungstoken zu canceln.
         * @param cancellationToken
         */
        'booking.cancelByToken'(cancellationToken){
            var currentAvailability = Availabilities.findOne({bookedByCancellationToken: cancellationToken});
            if (currentAvailability != undefined){
                console.log(currentAvailability.userId); // mit der könnte man wohl noch die mailadresse des profs raussuchen
                console.log(Meteor.user(currentAvailability.userId).emails[0].address)
                return Meteor.call('booking.cancel',currentAvailability._id,function () {
                    sendMail({
                        to: currentAvailability.bookedByEmail,
                        subject: "You have a cancelled a date with your professor!",
                        text: "Hello "+currentAvailability.bookedByName+",\n"+
                        "your booking for CALENDARNAME from "+currentAvailability.startDate+" to "+currentAvailability.endDate+" has been canceled."
                    });
                    sendMail({
                        to: Meteor.user(currentAvailability.userId).emails[0].address,
                        subject: "Meeting at "+currentAvailability.startDate+" canceled",
                        text: "Hello "+Meteor.user(currentAvailability.userId).profile.name+",\n"+
                        currentAvailability.bookedByName+" has canceled his booking for CALENDARNAME from "+currentAvailability.startDate+" to "+currentAvailability.endDate+"."
                    })
                });
            }
        },
        /**
         * Methode um eine Buchung durch den Besitzer zu canceln.
         * @param cancellationToken
         */
        'booking.cancelByOwner'(availabilityId,reason){
            var currentAvailability = Availabilities.findOne({_id: availabilityId});
            return Meteor.call('booking.cancel',currentAvailability._id,function () {
                var message;
                if (reason != undefined){
                    message = "\nHe added the following message for you: \n"+reason;
                };
                sendMail({
                    to: currentAvailability.bookedByEmail,
                    subject: "You canceled a date with your professor!",
                    text: "Hello "+currentAvailability.bookedByName+",\n"+
                    "your booking for CALENDARNAME from "+currentAvailability.startDate+" to "+currentAvailability.endDate+" has been canceled by the owner."+message
                });
            });
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
        Availabilities.remove({userId: this.userId, bookedByDate: {$lt: new Date(moment().add(-reservationThreshold,'m'))}, bookedByConfirmed: false});
        // Rückgabewert mit der Anzahl verbliebener Availibilities, könnte man bspw. in einem Info-Feld ausgeben. Die Anzal gelöschter könnte man auch ausgeben if you want.
        return Availabilities.find({userID: this.userID},{bookedByDate: {$lt: new Date(moment().add(-reservationThreshold,'m'))}}).count();
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
});
