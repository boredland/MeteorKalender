/**
 * Created by tobi on 15.11.16.
 */
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {availabilitiesSchema} from "./availabilitiesSchema";
import {} from "/imports/api/collectionPublications";
import {Calendars} from '/imports/api/calendarsCollection';

export let Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

Meteor.startup(function () {
    if (Meteor.isServer) {
        Availabilities._ensureIndex({"calendarID": 1});
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
    let sendMail = function (options) {
        return Meteor.call('sendMail', options);
    };

    /**
     * Funktion checkt ob die Daten für den Insert ok sind
     * @param startTime
     * @param endTime
     * @param doc
     * @param thisUserId
     */
    let checkInsertionConditions = function (startTime, endTime, doc, thisUserId) {
        let duration = Math.round((moment(doc.endTime) - moment(doc.startTime)) / (1000 * 60));
        if (startTime > endTime) {
            throw new EvalError("Startdate: " + startTime + " is bigger than Enddate " + endTime);
        }
        if (duration < doc.chunkDuration) {
            throw new EvalError("Duration " + duration + " is shorter than Chunkperiod " + doc.chunkDuration);
        }
        if (!thisUserId) {
            throw new Meteor.Error('not-authorized');
        }
    };

    /**
     * Funktion fügt Daten in die MongoDB Collection ein.
     * @param thisUserId
     * @param startDate
     * @param endDate
     * @param calendarID
     * @param familyId
     */
    let insertAvailability = function (thisUserId, startDate, endDate, calendarID, familyId) {
        return Availabilities.insert({
            userId: thisUserId,
            startDate: startDate,
            endDate: endDate,
            calendarId: calendarID,
            familyId: familyId
        });
    };
    /**
     * This will check that there are no Availabilities for this user at the same time or overlapping times.
     */
    Availabilities.before.insert(function (userId, doc) {
        let new_startdate = new Date(doc.startDate);
        let new_enddate = new Date(doc.endDate);
        Availabilities.find({userId: doc.userId, startDate: {$gt: new Date()}}).fetch().map( ( availability ) => {
            if (availability !== undefined) {
                let existing_startdate = new Date(availability.startDate);
                let existing_enddate = new Date(availability.endDate);
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
        let availability = Availabilities.findOne({_id: doc._id});
        if (availability.bookedByConfirmed){
            throw Meteor.Error("is-booked","This availibility is booked and therefor only can be cancelled.")
        }
        if (!availability.bookedByConfirmed && availability.bookedByDate && (moment(availability.bookedByDate) > moment().add(-reservationThreshold,'m'))){
            throw Meteor.Error("is-reserved","This availibility is reserved and therefor only can be cancelled.")
        }
    });
    /**
     *     TODO: Bestimmen, welche Methoden auf den Client laufen dürfen.
     */
    Meteor.methods({
        /**
         * Fügt Availabilities ein. Dabei werden die Availabilities entsprechend der Inputwerte geteilt und einzeln eingefügt.
         * Alle Availabilities die in einem aufruf erstellt werden, bekommen die selbe familyId zugewiesen.
         * @param doc
         */
        'availabilities.insert'(doc) {
            let startTime = moment(doc.startDate).hour(moment(doc.startTime).get('hour')).minute(moment(doc.startTime).get('minute')).seconds(0);
            let endTime = moment(doc.startDate).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute')).seconds(0);
            let repeatUntil = moment(doc.repeatUntil).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute'));
            let familyid = Random.id().substring(0, 4);

            checkInsertionConditions(startTime, endTime, doc, this.userId);
            let startTimeModified = startTime;
            let endTimeModified = endTime;
            let overlapErrorCount = 0;
            let bankHolidayCount = 0;
            do {
                let chunkEndTime = startTimeModified;
                if ((!isThisBankHoliday(startTimeModified) && (doc.dontSkipHolidays === false)) || doc.dontSkipHolidays === true) {
                    // this is for the chunks
                    do {
                        let chunkStartTime = chunkEndTime;
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
            } while (startTimeModified <= repeatUntil && doc.repeatInterval !== undefined);
            if (overlapErrorCount > 0 || bankHolidayCount > 0) {
                throw new Meteor.Error('overlap',overlapErrorCount+" overlapping availabilities and "+bankHolidayCount+" bank holidays skipped.");
            }
        },
        /**
         * Erstellt eine Buchung.
         * @param doc
         */
        'booking.insert'(doc){
            // check if this has an peding active reservation
            if (Availabilities.findOne({_id: doc.availabilityId, bookedByDate: {$gt: new Date(moment().add(-reservationThreshold,'m'))}})){
                throw new Meteor.Error("pending-reservation","This availability has a pending reservation and therefore can't be reserved at this point.")
            }
            //generate our random verification token
            let verificationToken = Random.id();
            // generate our random cancellation-token
            let cancellationToken = Random.id();
            Availabilities.update(doc.availabilityId, {
                $set: {
                    bookedByEmail: doc.bookedByEmail,
                    bookedByName: doc.bookedByName,
                    bookedByConfirmed: false,
                    bookedByDate: new Date(),
                    bookedByCalendarId: doc.bookedByCalendarId,
                    bookedByConfirmationToken: verificationToken,
                    bookedByCancellationToken: cancellationToken
                }
            },function () {
                // Send Mails if the update was successful.
                // check if the availability is in the database.
                let currentAvailability = Availabilities.findOne({
                    bookedByEmail: doc.bookedByEmail,
                    bookedByName: doc.bookedByName,
                    bookedByConfirmed: false,
                    bookedByCalendarId: doc.bookedByCalendarId,
                    bookedByConfirmationToken: verificationToken,
                    bookedByCancellationToken: cancellationToken
                });
                let currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
                if (currentAvailability !== undefined){
                    sendMail({
                        to: doc.bookedByEmail,
                        subject: "Your reservation needs confirmation",
                        text: "Hello "+doc.bookedByName+",\n"+
                        "Thank you for your reservation for an availability at "+currentCalendar.name+". \n" +
                        "We need you to click at the following link to activate your booking: \n" +
                        Meteor.absoluteUrl()+"verify_booking/"+currentAvailability.bookedByConfirmationToken +"\n"
                    });
                    return true;
                } else {
                    throw new Meteor.Error('booking-error',"There was an error saving your booking information.");
                }
            });
        },
        /**
         * setzt eine Availability auf "booking confirmed".
         * @param availabilityId ID der Availability
         */
        'booking.confirm'(verifyBookingToken){
            let currentAvailability = Availabilities.findOne({
                bookedByConfirmed: false,
                bookedByConfirmationToken: verifyBookingToken
            }, {});
            if (currentAvailability !== undefined){
                let currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
                if (currentCalendar !== undefined){
                    return Availabilities.update(currentAvailability._id,{$set: {bookedByConfirmed: true, bookedByConfirmationToken: null}},function () {
                        sendMail({
                            to: currentAvailability.bookedByEmail,
                            subject: "You have an appointment with " + Meteor.user(currentAvailability.userId).profile.name + "!",
                            text: "Hello "+currentAvailability.bookedByName+",\n"+
                            "your booking for "+currentCalendar.name+" from "+formatDateTime(currentAvailability.startDate)+" to "+formatDateTime(currentAvailability.endDate)+" has been confirmed. \n" +
                            "\nIf you'd like to cancel the meeting, you'll have to click at the following link: "+
                            Meteor.absoluteUrl()+"cancel_booking/"+currentAvailability.bookedByCancellationToken
                        });
                    });
                } else {
                    throw new Meteor.Error('confirmation-error',"There was an error confirming your activation. Either your token has not been found or you've already confirmed your booking.");
                }
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
                    bookedByCalendarId: null,
                }
            });
        },
        /**
         * Methode um eine Buchung anhand des Stornierungstoken zu canceln.
         * @param cancellationToken
         */
        'booking.cancelByToken'(cancellationToken){
            let currentAvailability = Availabilities.findOne({bookedByCancellationToken: cancellationToken});
            let currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            if (currentAvailability !== undefined){
                console.log(currentAvailability.userId); // mit der könnte man wohl noch die mailadresse des profs raussuchen
                console.log(Meteor.user(currentAvailability.userId).emails[0].address)
                return Meteor.call('booking.cancel',currentAvailability._id,function () {
                    sendMail({
                        to: currentAvailability.bookedByEmail,
                        subject: "You have cancelled your appointment with " + Meteor.user(currentAvailability.userId).profile.name + "!",
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
            let currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
            let currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            return Meteor.call('booking.cancel',currentAvailability._id,function () {
                let message;
                if (reason !== undefined){
                    message = "\nHe added the following message for you: \n"+reason;
                }
                sendMail({
                    to: currentAvailability.bookedByEmail,
                    subject: Meteor.user(currentAvailability.userId).profile.name + " has cancelled your appointment",
                    text: "Hello "+currentAvailability.bookedByName+",\n"+
                    "your booking for "+currentCalendar.name+" from "+formatDateTime(currentAvailability.startDate)+" to "+formatDateTime(currentAvailability.endDate)+" has been cancelled by " + Meteor.user(currentAvailability.userId).profile.name +  "."+message
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
            return Availabilities.remove({
                userId: this.userId,
                bookedByDate: undefined
            })
        },
        /**
         * Löscht eine Verfügbarkeit mitsamt ihrer Wiederholungen
         * ggf. könnte man noch ne Methode "removeAllRepetitions" einfügen, bei der man dann einfach das aktuelle datum als "fromDate_in"-Parameter übergibt.
         * @param availabilities.removeFutureRepetitions
         */
        'availabilities.removeFutureRepetitions'(availabilityId){
            check(availabilityId, String);
            var familyId = Availabilities.findOne(availabilityId).familyId;
            var siblingStartTime = Availabilities.findOne(availabilityId).startTime ;

            console.log(siblingStartTime)

            //startTime in Datenstruktur abspeichern würde das vereinfachen....

        },
        /**
         * Delete this and all future events of the family. Still not so sure if that is good in means of usability.
         * ggf. könnte man noch ne Methode "removeAllFamily" einfügen, bei der man dann einfach das aktuelle datum als "fromDate_in"-Parameter übergibt.
         * @param availabilityId
         * @returns {null}
         */
        'availabilities.removeByFamilyId'(availabilityId){
            check(availabilityId, String);

            var deletethis = Availabilities.findOne(availabilityId);
            if (this.userId !== deletethis.userId) {
                throw new Meteor.Error('not-authorized');
            }

            var familyId = Availabilities.findOne(availabilityId).familyId;
            Availabilities.remove({familyId: familyId, bookedByDate: undefined})

        }
    });
}

// Methods we want to be run on the client.
Meteor.methods({

});
