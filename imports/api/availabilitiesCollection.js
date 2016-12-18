/**
 * Created by tobi on 15.11.16.
 */
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {availabilitiesSchema} from "./availabilitiesSchema";
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


// it is best practice to explicitly allow crud-actions
Availabilities.allow({
    insert: function (endTime, repeatInterval, repeatUntil, startDate, startTime) {
        return true; // is there some meaningful check we could use?
    },
    update: function (startDate, endDate, calendarId, userId) {
        return true;
    }
});

if (Meteor.isServer) {
    var sendMail = function (options) {
        return Meteor.call('sendMail',options);
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
        Availabilities.find({userId: doc.userId, startDate: {$gt: new Date()}}).fetch().map( ( availability ) => {
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
            var bankHolidayCount = 0;
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
                } else {
                    bankHolidayCount++
                }
                startTimeModified.add(doc.repeatInterval, 'w');
                endTimeModified.add(doc.repeatInterval, 'w');
            } while (startTimeModified <= repeatUntil && doc.repeatInterval != undefined);
            if (overlapErrorCount > 0 || bankHolidayCount > 0) {
                throw new Meteor.Error('overlap',overlapErrorCount+" overlapping availabilities and "+bankHolidayCount+" bank holidays skipped.");
            }
        },
        /**
         * Erstellt eine Buchung.
         * @param doc
         */
        'booking.insert'(doc){
            console.log("bla",doc);

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
                    bookedByCalendarId: doc.bookedByCalendarId,
                    bookedByConfirmationToken: verificationToken,
                    bookedByCancellationToken: cancellationToken,
                },
            });
            // Send Mails if the insertion was successful.
            // check if the availability is in the database.
            var currentAvailability = Availabilities.findOne({bookedByConfirmed: false, bookedByConfirmationToken: verificationToken});
            var currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            if (currentAvailability != undefined){
                this.unblock();
                sendMail({
                    to: doc.bookedByEmail,
                    subject: "Your reservation needs confirmation",
                    text: "Hello "+doc.bookedByName+",\n"+
                    "Thank you for your reservation for an availability at "+currentCalendar.name+". \n" +
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
            var currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            if (currentAvailability != undefined){
                console.log("booking confirmed")
                return Availabilities.update(currentAvailability._id,{$set: {bookedByConfirmed: true, bookedByConfirmationToken: null}},function () {
                    sendMail({
                        to: currentAvailability.bookedByEmail,
                        subject: "You have an appointment with your professor!",
                        text: "Hello "+currentAvailability.bookedByName+",\n"+
                        "your booking for "+currentCalendar.name+" from "+formatDateTime(currentAvailability.startDate)+" to "+formatDateTime(currentAvailability.endDate)+" has been confirmed. \n" +
                        "\nIf you'd like to cancel the meeting, you'll have to click at the following link: "+
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
            var currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            if (currentAvailability != undefined){
                console.log(currentAvailability.userId); // mit der könnte man wohl noch die mailadresse des profs raussuchen
                console.log(Meteor.user(currentAvailability.userId).emails[0].address)
                return Meteor.call('booking.cancel',currentAvailability._id,function () {
                    sendMail({
                        to: currentAvailability.bookedByEmail,
                        subject: "You have a cancelled a date with your professor!",
                        text: "Hello "+currentAvailability.bookedByName+",\n"+
                        "your booking for "+currentCalendar.name+" from "+formatDateTime(currentAvailability.startDate)+" to "+formatDateTime(currentAvailability.endDate)+" has been cancelled."
                    });
                    sendMail({
                        to: Meteor.user(currentAvailability.userId).emails[0].address,
                        subject: "Meeting at "+formatDateTime(currentAvailability.startDate)+" canceled",
                        text: "Hello "+Meteor.user(currentAvailability.userId).profile.name+",\n"+
                        currentAvailability.bookedByName+" has cancelled his booking for "+currentCalendar.name+" from "+formatDateTime(currentAvailability.startDate)+" to "+formatDateTime(currentAvailability.endDate)+"."
                    })
                });
            }
        },
        /**
         * Methode um eine Buchung durch den Besitzer zu canceln.
         * @param availabilityId
         * @param reason
         */
        'booking.cancelByOwner'(availabilityId,reason){
            var currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
            var currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            return Meteor.call('booking.cancel',currentAvailability._id,function () {
                var message;
                if (reason != undefined){
                    message = "\nHe added the following message for you: \n"+reason;
                };
                sendMail({
                    to: currentAvailability.bookedByEmail,
                    subject: "You cancelled a date with your professor!",
                    text: "Hello "+currentAvailability.bookedByName+",\n"+
                    "your booking for "+currentCalendar.name+" from "+formatDateTime(currentAvailability.startDate)+" to "+formatDateTime(currentAvailability.endDate)+" has been cancelled by the owner."+message
                });
            });
        },
        /**
         * Löscht eine Availability.
         * @param availabilityID
         */
        'availabilities.remove'(availabilityId){
            //check whether the ID which should be deleted is a String
            check(availabilityId, String);
            return Availabilities.remove({_id: availabilityId, userId: this.userId});
        },

        /**
         * Löscht alle zukünftigen Availabilities des gegenwärtigen Benutzers, die weder reserviert, noch gebucht sind.
         * @param availabilities.removeAll
         */
        'availabilities.removeAll'(){
            // loescht alle mit abgelaufenen reservierungen oder die kein bookedByDate gesetzt haben.
            return Availabilities.find({
                userId: this.userId,
                $or: [
                    { bookedByDate: {$lt: new Date(moment().add(-reservationThreshold,'m'))}, bookedByConfirmed: false },
                    { bookedByDate: undefined }
                ],
            }).forEach(
                function(availability){
                    return Meteor.call('availabilities.remove',availability._id);
                }
            )
        },
        /**
         * Löscht eine Verfügbarkeit mitsamt ihrer Wiederholungen
         * @param availabilities.removeChunkRepetitions
         */
        'availabilities.removeRepetitions'(availabilityId){
            var currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
            var startDate = moment(currentAvailability.startDate);
            return Availabilities.find({
                userId: this.userId,
                $or: [
                    { bookedByDate: {$lt: new Date(moment().add(-reservationThreshold,'m'))}, bookedByConfirmed: false },
                    { bookedByDate: undefined }
                ],
                familyId: currentAvailability.familyId,
            }).forEach(
                function(availability){
                    if (
                        (startDate.get('h')==moment(availability.startDate).get('h'))&&
                        (startDate.get('m')==moment(availability.startDate).get('m'))&&
                        (moment(availability.startDate) >= startDate) // nur dieses und zukünftige
                    ) {
                        return Meteor.call('availabilities.remove',availability._id);
                    }
                }
            )
        },
        /**
         * Delete this and all future events of the family. Still not so sure if that is good in means of usability.
         * @param availabilityId
         * @returns {null}
         */
        'availabilities.removeFamily'(availabilityId){
            var currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
            var startDate = moment(currentAvailability.startDate);
            return Availabilities.find({
                userId: this.userId,
                $or: [
                    { bookedByDate: {$lt: new Date(moment().add(-reservationThreshold,'m'))}, bookedByConfirmed: false },
                    { bookedByDate: undefined }
                ],
                familyId: currentAvailability.familyId,
            }).forEach(
                function(availability){
                    if (moment(availability.startDate) >= startDate) {
                        return Meteor.call('availabilities.remove',availability._id);
                    }
                }
            )
        },
    });
};

// Methods we want to be run on the client.
Meteor.methods({

});
