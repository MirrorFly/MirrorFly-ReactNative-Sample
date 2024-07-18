import SDK from '../../SDK/SDK';
import { callConverisonInterval } from '../../calls/components/CallConversionPopUp';
import { callConversion } from '../../redux/callStateSlice';
import store from '../../redux/store';

export const clearIntervalConversionPopUp = async () => {
   const callConversionData = store.getState().callData.callConversionData || {};
   callConversionData.status === 'request_waiting' && SDK.cancelVideoCallSwitchRequest();
   clearInterval(callConverisonInterval);
   store.dispatch(callConversion());
};
