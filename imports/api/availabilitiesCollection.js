/**
 * Created by tobi on 15.11.16.
 */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
export const Availabilities = new Mongo.Collection("availabilities");

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('availabilities', function tasksPublication() {
        return Availabilities.find();
    });
}

Meteor.methods({
    'availabilities.insert'(text) {
        check(text, String);

        if (! this.userId) {
            alert("login To create an Availability")
            throw new Meteor.Error('not-authorized');

        }

        Availabilities.insert({
            text,
            createdAt: new Date(),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
        });
    },
});