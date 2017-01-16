/**
 * Created by tobi on 15.11.16.
 */
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {check} from "meteor/check";
import {availabilitiesSchema} from "./availabilitiesSchema";
import {Calendars} from "/imports/api/calendarsCollection";

export let Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

Meteor.startup(function () {
    if (Meteor.isServer) {
        Availabilities._ensureIndex({"calendarId": 1});
        console.log("created Index over calenderId in Availabilities Collection");
        Availabilities._ensureIndex({"userId": 1});
        console.log("created Index over userId in Availabilities Collection");
        Availabilities._ensureIndex({"expiryDate": 1}, {expireAfterSeconds: 0});
        console.log("ensured expiry");

        var addCommentRule = { type: 'method', name: 'addComment'}
        DDPRateLimiter.addRule(addCommentRule,5,100);


        const METHODS = _.pluck([
            "booking.insert",
            "booking.confirm",
            "booking.cancel",
            "booking.cancelByToken",
            "booking.cancelByOwner",
            "availabilities.insert",
            "availabilities.remove",
            "availabilities.removeAll",
            "availabilities.removeFutureRepetitions",
            "availabilities.removeFutureFamily"
        ], 'name');

        // Only allow 5 list operations per connection per second
        DDPRateLimiter.addRule({
            name(name) {
                return _.contains(METHODS, name);
            },
            // Rate limit per connection ID
            connectionId() { return true; }
        }, 5, 1000);

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
    var checkForOverlap = function (userId, new_startdate, new_enddate, thisDocId) {
        /**
         * This will check that there are no Availabilities for this user at the same time or overlapping times.
         */
        Availabilities.find({userId: userId, startDate: {$gt: new Date()}}).fetch().map((availability) => {
            if (availability !== undefined && availability._id !== thisDocId) {
                let existing_startdate = new Date(availability.startDate);
                let existing_enddate = new Date(availability.endDate);
                //console.log("Are " + new_startdate + " or "+new_enddate+" between " + existing_startdate + " or " + existing_enddate + "?");
                if (
                    (
                        (existing_startdate <= new_startdate ) && (new_startdate <= existing_enddate)
                    ) ||
                    (
                        (existing_startdate <= new_enddate) && (new_enddate <= existing_enddate)
                    ) ||
                    (
                        (new_startdate <= existing_startdate) && (new_enddate >= existing_enddate)
                    )
                ) {
                    throw new Meteor.Error("overlap", "The availability you wanted to create/update overlaps with an existing one.");
                }
            }
            return true;
        });
    };
    var checkStartEndLogic = function (userId, new_startdate, new_enddate) {
        /**
         * This will check that the startdate is not after the enddate
         */
        if (new_startdate > new_enddate) {
            throw new EvalError("Startdate: " + new_startdate + " is bigger than Enddate " + new_enddate);
        }
    };
    var checkDuration = function (new_startdate, new_enddate, chunkDuration) {
        let duration = Math.round((moment(new_enddate) - moment(new_startdate)) / (1000 * 60));
        /**
         * This will check that the actual duration of the insertion is not smaller than the chunks duration. Do we really need that??
         */
        if (duration < chunkDuration) {
            throw new EvalError("Duration " + duration + " is shorter than Chunkperiod " + chunkDuration);
        }
    };

    Availabilities.before.update(function (userId, doc, fieldNames, modifier, options) {
        if (modifier.$set.startDate) {
            modifier.$set.startDate = new Date(moment(modifier.$set.startDate).seconds(1));
        }
        let new_startdate = new Date(modifier.$set.startDate);
        let new_enddate = new Date(modifier.$set.endDate);
        checkForOverlap(userId, new_startdate, new_enddate, doc._id);
        checkStartEndLogic(userId, new_startdate, new_enddate);
    });

    Availabilities.before.insert(function (userId, doc) {
            let new_startdate = new Date(doc.startDate);
            let new_enddate = new Date(doc.endDate);
            checkForOverlap(userId, new_startdate, new_enddate, doc._id);
            checkStartEndLogic(userId, new_startdate, new_enddate);
            checkDuration(new_startdate, new_enddate, doc.chunkDuration);
    });

    /**
     * Checks vor dem Löschvorgang
     * Hier sollte geprüft werden, dass nichts mit buchungsmerkmalen gelöscht wird.
     */
    Availabilities.before.remove(function (userId, doc) {
        let availability = Availabilities.findOne({_id: doc._id});
        if (availability.bookedByConfirmed) {
            throw Meteor.Error("is-booked", "This availibility is booked and therefore can only be cancelled.")
        }
        if (!availability.bookedByConfirmed && availability.bookedByDate && (moment(availability.bookedByDate) > moment().add(-reservationThreshold, 'm'))) {
            throw Meteor.Error("is-reserved", "This availibility is reserved and therefore can only be cancelled.")
        }
    });

    /**
     * Serverseitige methoden. Bisher würde ich sagen müssen hier nur die Dinge hin, die emails verschicken...
     */
    Meteor.methods({
        /**
         * Erstellt eine Buchung.
         * @param doc
         */
        'booking.insert'(doc){
            // check if this has an peding active reservation
            if (Availabilities.findOne({
                    _id: doc.availabilityId,
                    bookedByDate: {$gt: new Date(moment().add(-reservationThreshold, 'm'))}
                })) {
                throw new Meteor.Error("pending-reservation", "This availability has a pending reservation and therefore can't be reserved at this point.")
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
            }, function () {
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
                if (currentAvailability !== undefined) {
                    sendMail({
                        to: doc.bookedByEmail,
                        subject: "Your reservation needs confirmation",
                        text: "Hello " + doc.bookedByName + ",\n" +
                        "Thank you for your reservation for an availability at " + currentCalendar.name + " by " + Meteor.users.findOne(currentCalendar.userId).profile.name + ". \n" +
                        "We need you to click at the following link to activate your booking: \n" +
                        Meteor.absoluteUrl() + "verify_booking/" + currentAvailability.bookedByConfirmationToken + "\n"
                    });
                    return true;
                } else {
                    throw new Meteor.Error('booking-error', "There was an error saving your booking information.");
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
            var icsCalendar = function (startdate, enddate, calendar_name, availability_id, provider_name, provider_address, booker_name, booker_address, location) {
                return new IcsGenerator({
                    prodId: "//MeteorKalender//Frankfurt University of Applied Sciences",
                    method: "REQUEST",
                    events: [
                        {
                            uid: availability_id + "@meteorkalender",
                            summary: calendar_name + " with " + provider_name,
                            dtStart: startdate,
                            dtEnd: enddate,
                            organizer: {cn: provider_name, mailTo: provider_address},
                            location: location,
                            attendees: [
                                {cn: booker_name, mailTo: booker_address}
                            ]
                        }
                    ]
                });
            };
            if (currentAvailability !== undefined) {
                let currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
                if (currentCalendar !== undefined) {
                    return Availabilities.update(currentAvailability._id, {
                        $set: {
                            bookedByConfirmed: true,
                            bookedByConfirmationToken: null,
                            expiryDate: null,
                        }
                    }, function () {
                        var currentUser = Meteor.users.findOne(currentCalendar.userId);
                        // Bestätigung für den Studenten
                        sendMail({
                            to: currentAvailability.bookedByEmail,
                            subject: "You have an appointment with " + currentUser.profile.name + "!",
                            text: "Hello " + currentAvailability.bookedByName + ",\n" +
                            "your booking for " + currentCalendar.name + " by " + currentUser.profile.name + " from " + formatDateTime(currentAvailability.startDate) + " to " + formatDateTime(currentAvailability.endDate) + " has been confirmed. \n" +
                            "\nIf you'd like to cancel the meeting, you'll have to click at the following link: " +
                            Meteor.absoluteUrl() + "cancel_booking/" + currentAvailability.bookedByCancellationToken,
                            attachments: [
                                {
                                    fileName: currentCalendar.name + "_" + currentAvailability.bookedByName + ".ics",
                                    contents: new icsCalendar(
                                        currentAvailability.startDate,
                                        currentAvailability.endDate,
                                        currentCalendar.name,
                                        currentAvailability._id,
                                        currentUser.profile.name,
                                        currentUser.profile.email,
                                        currentAvailability.bookedByName,
                                        currentAvailability.bookedByEmail,
                                        currentCalendar.location
                                    ).toIcsString()
                                }
                            ]
                        });
                        // Bestätigung für den Professor
                        sendMail({
                            to: currentUser.profile.email,
                            subject: "You have an appointment with " + currentAvailability.bookedByName + "!",
                            text: "Hello " + currentUser.profile.name + ",\n" +
                            currentAvailability.bookedByName + " has confirmed his booking for " + currentCalendar.name + " from " + formatDateTime(currentAvailability.startDate) + " to " + formatDateTime(currentAvailability.endDate) + "."
                        })
                    });
                } else {
                    throw new Meteor.Error('confirmation-error', "There was an error confirming your activation. Either your token has not been found or you've already confirmed your booking.");
                }
            } else {
                throw new Meteor.Error('confirmation-error', "There was an error confirming your activation. Either your token has not been found or you've already confirmed your booking.");
            }
        },
        /**
         * Setzt die Buchung zurück
         * @param availabilityID
         */
        'booking.cancel'(availabilityId, endDate){
            check(availabilityId, String);
            Availabilities.update({_id: availabilityId}, {
                $set: {
                    bookedByName: null,
                    bookedByDate: null,
                    bookedByEmail: null,
                    bookedByConfirmed: false,
                    bookedByCancellationToken: null,
                    bookedByCalendarId: null,
                    expiryDate: endDate
                }
            });
        },
        /**
         * Methode um eine Buchung anhand des Stornierungstoken zu canceln.
         * @param cancellationToken
         */
        'booking.cancelByToken'(cancellationToken){
            let currentCalendar, currentAvailability;
            if ((currentAvailability = Availabilities.findOne({
                    bookedByCancellationToken: cancellationToken,
                    startDate: {$gt: new Date()}
                })) && (currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId}))) {
                return Meteor.call('booking.cancel', currentAvailability._id, currentAvailability.endDate, function () {
                    var currentUser = Meteor.users.findOne(currentCalendar.userId);
                    // Mail for the student
                    sendMail({
                        to: currentAvailability.bookedByEmail,
                        subject: "You have cancelled your appointment with " + currentUser.profile.name + "!",
                        text: "Hello " + currentAvailability.bookedByName + ",\n" +
                        "your booking for " + currentCalendar.name + " from " + formatDateTime(currentAvailability.startDate) + " to " + formatDateTime(currentAvailability.endDate) + " has been cancelled."
                    });
                    // Mail for the professor
                    sendMail({
                        to: currentUser.profile.email,
                        subject: "Meeting at " + formatDateTime(currentAvailability.startDate) + " canceled",
                        text: "Hello " + currentUser.profile.name + ",\n" +
                        currentAvailability.bookedByName + " has cancelled his booking for " + currentCalendar.name + " from " + formatDateTime(currentAvailability.startDate) + " to " + formatDateTime(currentAvailability.endDate) + "."
                    })
                });
            } else {
                throw new Meteor.Error("token-expired", "This token has either already been used or does not exist or the booking you want to cancel started in the past.")
            }
        },
        /**
         * Methode um eine Buchung durch den Besitzer zu canceln.
         * @param availabilityId
         * @param reason
         */
        'booking.cancelByOwner'(availabilityId, reason){
            let currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
            let currentCalendar = Calendars.findOne({_id: currentAvailability.bookedByCalendarId});
            check(availabilityId, String);
            return Meteor.call('booking.cancel', currentAvailability._id, currentAvailability.endDate, function () {
                var currentUser = Meteor.users.findOne(currentAvailability.userId);
                let message;
                if (reason !== undefined) {
                    message = "\nHe added the following message for you: \n" + reason;
                }
                sendMail({
                    to: currentAvailability.bookedByEmail,
                    subject: currentUser.profile.name + " has cancelled your appointment",
                    text: "Hello " + currentAvailability.bookedByName + ",\n" +
                    "your booking for " + currentCalendar.name + " from " + formatDateTime(currentAvailability.startDate) + " to " + formatDateTime(currentAvailability.endDate) + " has been cancelled by " + Meteor.user(currentAvailability.userId).profile.name + "." + message
                });
            });
        }
    });
}

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
        let familyId = Random.id().substring(0, 6);
        let startTimeModified = startTime;
        let endTimeModified = endTime;
        let overlapErrorCount = 0;
        let bankHolidayCount = 0;
        do {
            let chunkEndTime = startTimeModified;
            if ((!isThisBankHoliday(startTimeModified) && (doc.skipHolidays === true)) || doc.skipHolidays === false) {
                // this is for the chunks
                do {
                    let chunkStartTime = chunkEndTime;
                    chunkEndTime = moment(chunkEndTime).add(doc.chunkDuration, 'm');
                    try {
                        Availabilities.insert({
                            userId: this.userId,
                            startDate: new Date(chunkStartTime.seconds(1)),
                            endDate: new Date(chunkEndTime.seconds(0)),
                            calendarId: doc.calendarId,
                            familyId: familyId,
                            expiryDate: new Date(chunkStartTime.seconds(1))
                        });
                    } catch (err) {
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
            throw new Meteor.Error('overlap', overlapErrorCount + " overlapping availabilities and " + bankHolidayCount + " bank holidays skipped.");
        }
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
            $or: [
                {bookedByDate: {$lt: new Date(moment().add(-reservationThreshold, 'm'))}, bookedByConfirmed: false},
                {bookedByDate: undefined}
            ]
        });
    },
    /**
     * Löscht eine Verfügbarkeit mitsamt ihrer Wiederholungen
     * @param availabilities.removeFutureRepetitions
     */
    'availabilities.removeFutureRepetitions'(availabilityId, fromDate_in){
        let currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
        let fromDate;
        check(availabilityId, String);
        if (!fromDate_in) {
            fromDate = moment(currentAvailability.startDate); // nur dieses und zukünftige
        } else {
            fromDate = moment(fromDate_in).hour(moment(currentAvailability.startDate).get('h')).minute(moment(currentAvailability.startDate).get('m')).second(1).millisecond(0); // ugly and to much, but should work now.
        }
        return Availabilities.find({
            userId: this.userId,
            $or: [
                {bookedByDate: {$lt: new Date(moment().add(-reservationThreshold, 'm'))}, bookedByConfirmed: false},
                {bookedByDate: undefined}
            ],
            familyId: currentAvailability.familyId
        }).forEach(function (availability) {
                if (
                    (fromDate.get('h') === moment(availability.startDate).get('h')) &&
                    (fromDate.get('m') === moment(availability.startDate).get('m')) &&
                    (availability.startDate >= new Date(fromDate))
                ) {
                    return Meteor.call('availabilities.remove', availability._id);
                }
            }
        )
    },
    /**
     * Delete this and all future events of the family. Still not so sure if that is good in means of usability.
     * @param availabilityId
     * @returns {null}
     */
    'availabilities.removeFutureFamily'(availabilityId, fromDate_in){
        let currentAvailability = Availabilities.findOne({_id: availabilityId, userId: this.userId});
        let fromDate;
        check(availabilityId, String);
        if (!fromDate_in) {
            fromDate = moment(currentAvailability.startDate); // nur dieses und zukünftige
        } else {
            fromDate = moment(fromDate_in);
        }
        return Availabilities.find({
            userId: this.userId,
            $or: [
                {bookedByDate: {$lt: new Date(moment().add(-reservationThreshold, 'm'))}, bookedByConfirmed: false},
                {bookedByDate: undefined},
            ],
            familyId: currentAvailability.familyId
        }).forEach(
            function (availability) {
                if (moment(availability.startDate) >= fromDate) {
                    return Meteor.call('availabilities.remove', availability._id);
                }
            }
        )
    }
});