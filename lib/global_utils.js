/**
 * Created by jonasstr on 18.12.16.
 */
import feiertagejs from "feiertagejs";
this.formatDateTime = function (date) {
    return moment(date).format('dddd, DD.MM.YYYY - HH:mm');
};
this.reservationThreshold = 10; // Minutes before a reservation invalidates
/**
 * Überprüft, ob es sich um einen Feiertag handelt.
 * @param date
 * @returns {*|boolean}
 */
this.isThisBankHoliday = function (date) {
    return feiertagejs.isHoliday(new Date(date), 'HE');
};