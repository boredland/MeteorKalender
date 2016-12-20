/**
 * Created by jonasstr on 19.12.16.
 */
if (Meteor.isClient) {
    Template.registerHelper( 'errorMessage', (pageSession) => {
        return pageSession.get("errorMessage");
    });
    Template.registerHelper( 'infoMessage', (pageSession) => {
        return pageSession.get("infoMessage");
    });

    Template.registerHelper('isPublished' , (published) => {
        if (published){
            return "checked";
        }
    });
}