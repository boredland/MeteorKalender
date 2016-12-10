/**
 * Created by tobi on 15.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {availabilitiesSchema} from './availabilitiesSchema';
import {Calendars} from './calendarsCollection';
import feiertagejs from 'feiertagejs';

export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.attachSchema(availabilitiesSchema);

Meteor.startup(function(){
    if (Meteor.isServer) {
        Availabilities._ensureIndex({"calendarID":1})
        console.log("created Index over calenderID in Availabilities Colleciton")
    }
})

if (Meteor.isServer) {
    // publication of Availabilities should only run on the server
    Meteor.publish('allAvailabilities', function availabilitiesPublication() {
        return Availabilities.find({userId: this.userId},{sort: {startdate: -1}});
    });
    Meteor.publish('calendarAvailabilities', function availabilitiesPublication(input_linkslug) {
        var calendar = Calendars.findOne({linkslug: input_linkslug, published: true});
        var calendarid = calendar._id;
        var options = {fields: {startDate: 1, endDate: 1}, sort: {startdate: -1}};
        var calendarEvents = Availabilities.find({calendarId: calendarid.toString(), startDate: {$gt: new Date()}},options);
        //console.log(calendarEvents);
        return calendarEvents;
    });
    /*Meteor.publish('singleCalendarName', function calendarPublication(input_linkslug) {
        var options = {fields: {name: 1}};
        var calendar = Calendars.find({linkslug: input_linkslug, published: true},options);
        return calendar;
    });*/
    Meteor.publish('singleAvailability', function availabilitiesPublication(input_availabilityId) {
        var availability = Availabilities.find({_id: input_availabilityId.toString(), userId: this.userId});
        return availability;
    });
    Meteor.publish('allFutureAvailabilities', function availabilitiesPublication() {
        var availabilities = Availabilities.find({userId: this.userId, startDate: {$gt: new Date(moment().add(-1,'h').set(0,'m'))}},{sort: {startdate: -1}});
        return availabilities;
    });
};

// it is best practice to explicitly allow crud-actions
Availabilities.allow({
    insert: function (endTime,repeatInterval,repeatUntil,startDate,startTime) {
        return true; // is there some meaningful check we could use?
    },
    update: function (startDate,endDate,calendarId,userId){
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

        checkInsertionConditions(startTime,endTime,doc,this.userId)

        var startTimeModified = startTime;
        var endTimeModified = endTime;
        do{
            var chunkEndTime = startTimeModified;
             do {
                chunkStartTime = chunkEndTime;
                chunkEndTime = moment(chunkEndTime).add(doc.chunkDuration,'m');
                insertAvailability(this.userId,chunkStartTime._d,chunkEndTime._d,doc.calendarId,familyid)

            } while (chunkEndTime < endTimeModified);
            startTimeModified.add(doc.repeatInterval,'w')
            endTimeModified.add(doc.repeatInterval,'w')
        }while(startTimeModified <= repeatUntil)

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

    },
    'booking.insert'(doc){
        //check whether the ID which should be deleted is a String
        console.log(doc);
    }
});

var isThisBankHoliday = function (date) {

    return feiertagejs.isHoliday(new Date(date), 'HE');
}

var checkInsertionConditions = function(startTime, endTime, doc, thisUserId){
    var duration = Math.round((moment(doc.endTime)-moment(doc.startTime))/(1000*60));
    if (startTime > endTime){
        throw new EvalError("Startdate: "+startTime+" is bigger than Enddate "+endTime);
    }
    if (duration < doc.chunkDuration){
        throw new EvalError("Duration "+duration+" is shorter than Chunkperiod "+doc.chunkDuration);
    }
    if (! thisUserId) {
        throw new Meteor.Error('not-authorized');
    }
}

var insertAvailability = function (thisUserId, startDate, endDate, calendarID, familyId) {

    Availabilities.insert({
        userId: thisUserId,
        startDate: startDate,
        endDate: endDate,
        calendarId: calendarID,
        familyId: familyId,
    });
}
