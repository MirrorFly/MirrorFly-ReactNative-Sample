import moment from "moment";

function datetoTime(secs) {
    var todayDate = new Date();
    todayDate.setSeconds(todayDate.getSeconds() - secs);
    return todayDate;
}

function secondsToHms(secs) {
    if (secs === 0) {
        return 0;
    }
    secs = Number(secs);
    var calcHours = Math.floor(secs / 3600);
    return calcHours > 0 ? calcHours : 0;
}

function findYesterday(secs, currentDate) {
    let currentDateInSec = currentDate.getUTCHours();
    let remaingSec = secondsToHms(secs) - currentDateInSec;
    return remaingSec <= 24 ? true : false;
}


/**
 * getConversationHistoryTime() method to perform convert UTCTime to Time format.
 *
 * @param {UTCTime} UTCTime
 */

export const getConversationHistoryTime = (UTCTime) => {
    let offset = moment().utcOffset();
    return moment.utc(UTCTime).utcOffset(offset).format("LT");
};
/**
 * getLastseen() method to perform convert seconds to user online or Last seen date format status.
 *
 * @param {secs} secs
 */
export const getLastseen = (secs) => {
    try {
        var userDate = datetoTime(secs);
        var currentDate = new Date();
        var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var HHMM = { hour: "numeric", minute: "numeric" };
        if (secs === 0) {
            return "Online";
        } else if (userDate.getDate() === currentDate.getDate() && userDate.getMonth() === currentDate.getMonth()) {
            return `last seen today at ${userDate.toLocaleTimeString("en-US", HHMM)}`;
        } else if ((userDate.getDate() === currentDate.getDate() - 1 && userDate.getMonth() === currentDate.getMonth()) || (userDate.getMonth() === (currentDate.getMonth() - 1) && findYesterday(secs, currentDate))) {
            return `last seen yesterday at ${userDate.toLocaleTimeString("en-US", HHMM)}`;
        } else if (
            (userDate.getDate() === currentDate.getDate() - 1 ||
                userDate.getDate() === currentDate.getDate() - 2 ||
                userDate.getDate() === currentDate.getDate() - 3 ||
                userDate.getDate() === currentDate.getDate() - 4 ||
                userDate.getDate() === currentDate.getDate() - 5 ||
                userDate.getDate() === currentDate.getDate() - 6) &&
            userDate.getMonth() === currentDate.getMonth()
        ) {
            return `last seen on ${weekday[userDate.getDay()]} at ${userDate.toLocaleTimeString("en-US", HHMM)}`;
        } else {
            if (userDate.getDate().toString().length > 1) {
                return `last seen ${userDate.getDate()}-${month[userDate.getMonth()]}-${userDate.getFullYear()}`;
            } else {
                return `last seen ${0}${userDate.getDate()}-${month[userDate.getMonth()]}-${userDate.getFullYear()}`;
            }
        }
    } catch (error) {
        console.log(error, 'Timestamp Error')
    }

};