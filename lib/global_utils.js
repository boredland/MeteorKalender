/**
 * Created by jonasstr on 18.12.16.
 */
var formatDateTime = function (date) {
    return moment(date).format('dddd, DD.MM.YYYY - HH:mm');
};
var reservationThreshold = 10; // Minutes before a reservation invalidates
