import React from 'react';
import {
   CALL_STATUS_BUSY,
   CALL_STATUS_CALLING,
   CALL_STATUS_CONNECTED,
   CALL_STATUS_CONNECTING,
   CALL_STATUS_DISCONNECTED,
   CALL_STATUS_ENGAGED,
   CALL_STATUS_HOLD,
   CALL_STATUS_RECONNECT,
   CALL_STATUS_RINGING,
} from '../../Helper/Calls/Constant';
import { capitalizeFirstLetter } from '../../Helper/Chat/Utility';
import { getCallDuration } from '../../Helper/Calls/Call';
import Store from '../../redux/store';
import { callDurationTimestamp } from '../../redux/Actions/CallAction';
import { useSelector } from 'react-redux';
import { StyleSheet, Text } from 'react-native';
import ApplicationColors from '../../config/appColors';

let interval = '';
const Timer = (props = {}) => {
   const { callStatus } = props;
   const callDuration = useSelector(state => state.callData.callDuration);
   // const [timerOn, setTimerOn] = React.useState(false);
   const [timerTime, setTimerTime] = React.useState(0);

   React.useEffect(() => {
      if (callStatus && callStatus.toLowerCase() === CALL_STATUS_CONNECTED) {
         startTimer();
      }
   }, []);

   React.useEffect(() => {
      if (callStatus?.toLowerCase() === CALL_STATUS_CONNECTED) {
         startTimer();
         return () => {
            stopTimer();
         };
      }
   }, [callStatus]);

   const startTimer = () => {
      // setTimerOn(true);
      let timerStart = callDuration || Date.now();
      console.log(timerStart, callDuration, '8900');
      Store.dispatch(callDurationTimestamp(timerStart));
      clearInterval(interval);
      interval = setInterval(() => {
         setTimerTime(Date.now() - timerStart);
      }, 300);
   };

   const stopTimer = () => {
      clearInterval(interval);
   };

   let content = null;
   if (
      callStatus &&
      [
         CALL_STATUS_RECONNECT,
         CALL_STATUS_CONNECTING,
         CALL_STATUS_DISCONNECTED,
         CALL_STATUS_CALLING,
         CALL_STATUS_ENGAGED,
         CALL_STATUS_RINGING,
         CALL_STATUS_BUSY,
         CALL_STATUS_HOLD,
      ].indexOf(callStatus.toLowerCase()) > -1
   ) {
      let callStatusText = callStatus?.toLowerCase();
      if (callStatus.toLowerCase() === CALL_STATUS_HOLD) {
         callStatusText = CALL_HOLD_STATUS_MESSAGE.toLowerCase();
      }
      content = `${capitalizeFirstLetter(callStatusText)}${
         callStatus.toLowerCase() !== CALL_STATUS_DISCONNECTED && callStatus.toLowerCase() !== CALL_STATUS_HOLD
            ? '...'
            : ''
      }`;
   } else {
      content = getCallDuration(timerTime);
   }
   return <Text style={styles.callTimeText}>{content}</Text>;
};

export default Timer;

const styles = StyleSheet.create({
   callTimeText: {
      fontSize: 12,
      color: ApplicationColors.white,
   },
});
