/**
 * Created by jonasstr on 14.11.16.
 */
export const Availabilities = new Mongo.Collection("availabilities");
Availabilities.insert({userId: "this is a userid",startDate: "this is a startdate",endDate: "this is an enddate",categoryId: "this is a cat_id"});