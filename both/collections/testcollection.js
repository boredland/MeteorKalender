/**
 * Created by tobi on 10.11.16.
 */
export const TestCollection = new Mongo.Collection("testcollection");
TestCollection.insert({text: "this is a test"});
TestCollection.insert({text: "this is a 2nd test"});
TestCollection.insert({text: "this is a 3rd test"});