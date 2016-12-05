/**
 * Created by tobi on 15.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {check} from 'meteor/check';
import {availabilitiesSchema} from './availabilitiesSchema';
import {Calendars} from './calendarsCollection';

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
        console.log("Linkslug: ",input_linkslug);
        var calendarid = Calendars.findOne({linkslug: input_linkslug, published: true})._id
        console.log("CalendarId: ", calendarid);
        var options = {fields: {startDate: 1, endDate: 1}, sort: {startdate: -1}};
        var calendarEvents = Availabilities.find({calendarId: calendarid},options);
        //console.log(calendarEvents);
        return calendarEvents;
    });
    Meteor.publish('singleAvailability', function availabilitiesPublication(input_availabilityId) {
        var availability = Availabilities.find({_id: input_availabilityId, userId: this.userId});
        console.log("Availability", availability);
        return availability;
    });
};

// it is best practice to explicitly allow crud-actions
Availabilities.allow({
    insert: function (endTime,repeatInterval,repeatUntil,startDate,startTime) {
        return true; // is there some meaningful check we could use?
    }
});

//methods can be called in every .js file which has "import { Meteor } from 'meteor/meteor';" .
Meteor.methods({
    'availabilities.insert'(doc) {
        //console.log(doc);
        var startdate = moment(doc.startDate).hour(moment(doc.startTime).get('hour')).minute(moment(doc.startTime).get('minute'));
        var enddate = moment(doc.startDate).hour(moment(doc.endTime).get('hour')).minute(moment(doc.endTime).get('minute'));
        var duration = (moment(doc.endTime)-moment(doc.startTime))/(1000*60)|0;
        var chunkarray = [];
        var familyid = Random.id().substring(0, 4);

        if (startdate > enddate){
            throw new EvalError("Startdate: "+startdate+" is bigger than Enddate "+enddate);
        }
        if (duration < doc.chunkPeriod){
            throw new EvalError("Duration "+duration+" is shorter than Chunkperiod "+doc.chunkPeriod);
        }
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
            do {
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
        };

        // the actual insertion
        for (i=0;i<flatarray.length;i++){
            //console.log("Startdate: "+flatarray[i].start._d+" till Enddate: "+flatarray[i].end._d);
            Availabilities.insert({
                userId: this.userId,
                startDate: flatarray[i].start._d,
                endDate: flatarray[i].end._d,
                calendarId: doc.calendarId,
                familyId: familyid,
            });
        };
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