import moment from 'moment';
import { DateTime } from 'luxon';

function datetoTime(secs) {
  let todayDate = new Date();
  todayDate.setSeconds(todayDate.getSeconds() - secs);
  return todayDate;
}

function secondsToHms(secs) {
  if (secs === 0) {
    return 0;
  }
  secs = Number(secs);
  let calcHours = Math.floor(secs / 3600);
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

export const getConversationHistoryTime = UTCTime => {
  let offset = moment().utcOffset();
  return moment.utc(UTCTime).utcOffset(offset).format('LT');
};

/**
 * changeTimeFormat() method to perform convert Timestamp it's effectively works for 16 digit to Time format.
 *
 * @param {timeStamp} time
 */

export const changeTimeFormat = time => {
  if (!time) {
    return '';
  } else if (time.toString().length === 16) {
    return moment((time / 1000000) * 1000)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
  } else {
    return moment(time).utc().format('YYYY-MM-DD HH:mm:ss');
  }
};

/**
 * formatAMPM() method to perform the am or pm format with time.
 *
 * @param {date} date
 */
const formatAMPM = date => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
};

/**
 * change16TimeWithDateFormat() method to  returns 26-May-2023 at 3:13PM.
 *
 * @param {timeStamp} time
 */

export const change16TimeWithDateFormat = time => {
  if (!time) {
    return '';
  } else if (time.toString().length === 16) {
    let convertedDate = moment(time / 1000).format('DD-MMM-YYYY');
    let convertedTime = moment(time / 1000).format('hh:mm A');
    return `${convertedDate} at ${convertedTime}`;
  } else {
    return moment(time).format('hh:mm A');
  }
};

/**
 * formatChatDate() method to perform convert into Today, Yesterday and Date format.
 *
 * @param {date} date
 */
export const formatChatDate = date => {
  const dateCurrent = DateTime.fromMillis(Date.now());
  const dateMessage = DateTime.fromJSDate(date);
  const datesDiff = dateCurrent.diff(dateMessage, 'days').toObject().days;
  if (!datesDiff) {
    return null; /** change ? to null */
  }
  const diffRounded = Math.round(datesDiff);

  if (diffRounded === 0) {
    return 'Today';
  } else if (diffRounded === 1) {
    return 'Yesterday';
  } else if (diffRounded > 1 && diffRounded <= 6) {
    return DateTime.fromJSDate(date).toFormat('cccc');
  } else {
    const isCurrentYear = date.getFullYear() === new Date().getFullYear();
    return DateTime.fromJSDate(date).toFormat(
      isCurrentYear ? 'dd-MMM' : 'dd-MMM-yyyy',
    );
  }
};

/**
 * formatChatTime() method to perform convert time into now, min ago, mins ago and date format.
 *
 * @param {date} date
 * @param {string} type
 */
export const formatChatTime = (date, type) => {
  if (type === 'recent-chat') {
    return formatAMPM(date);
  }
  const dateCurrent = DateTime.fromMillis(Date.now());
  const dateMessage = DateTime.fromJSDate(date);
  const datesDiff = dateCurrent.diff(dateMessage, 'minutes').toObject().minutes;

  if (!datesDiff) {
    return null; /** change ? to null */
  }

  const diffRounded = Math.round(datesDiff);

  if (diffRounded === 0) {
    return 'Now';
  } else if (diffRounded === 1) {
    return `${diffRounded} min ago`;
  } else if (diffRounded < 60) {
    return `${diffRounded} mins ago`;
  } else {
    return dateMessage.toFormat(TIME_FORMAT);
  }
};

/**
 * formatChatDateTime() method to perform the format date & time.
 *
 * @param {Date} date
 * @param {string} type
 */
export const formatChatDateTime = (date, type) => {
  const timeFormatted = formatChatTime(new Date(date), type);
  const dayFormatted = formatChatDate(new Date(date));
  if (type === 'recent-chat') {
    if (dayFormatted === 'Today') {
      return timeFormatted;
    }
    return dayFormatted;
  } else {
    if (timeFormatted.match(/Now|mins? ago/i)) {
      return timeFormatted;
    }
    return dayFormatted;
  }
};

/**
 * convertUTCTOLocalTimeStamp() method to perform convert UTC to local time formate.
 *
 * @param {date} date
 */
export const convertUTCTOLocalTimeStamp = date => {
  date = new Date(date.replace(/-/g, '/'));
  let newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
  return newDate;
};

/**
 * getLastseen() method to perform convert seconds to user online or Last seen date format status.
 *
 * @param {secs} secs
 */
export const getLastseen = secs => {
  try {
    let userDate = datetoTime(secs);
    let currentDate = new Date();
    let weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    let month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    let HHMM = { hour: 'numeric', minute: 'numeric' };
    if (secs === 0) {
      return 'Online';
    } else if (
      userDate.getDate() === currentDate.getDate() &&
      userDate.getMonth() === currentDate.getMonth()
    ) {
      return `last seen today at ${moment(userDate).format('h:mm A')}`;
    } else if (
      (userDate.getDate() === currentDate.getDate() - 1 &&
        userDate.getMonth() === currentDate.getMonth()) ||
      (userDate.getMonth() === currentDate.getMonth() - 1 &&
        findYesterday(secs, currentDate))
    ) {
      return `last seen yesterday at ${moment(userDate).format('h:mm A')}`;
    } else if (
      (userDate.getDate() === currentDate.getDate() - 1 ||
        userDate.getDate() === currentDate.getDate() - 2 ||
        userDate.getDate() === currentDate.getDate() - 3 ||
        userDate.getDate() === currentDate.getDate() - 4 ||
        userDate.getDate() === currentDate.getDate() - 5 ||
        userDate.getDate() === currentDate.getDate() - 6) &&
      userDate.getMonth() === currentDate.getMonth()
    ) {
      return `last seen on ${weekday[userDate.getDay()]} at ${moment(
        userDate,
      ).format('h:mm A')}`;
    } else {
      if (userDate.getDate().toString().length > 1) {
        return `last seen ${userDate.getDate()}-${
          month[userDate.getMonth()]
        }-${userDate.getFullYear()}`;
      } else {
        return `last seen ${0}${userDate.getDate()}-${
          month[userDate.getMonth()]
        }-${userDate.getFullYear()}`;
      }
    }
  } catch (error) {
    console.log(error, 'getLastseen error');
  }
};
