export { MirrorflyComponent } from '../App';
export { ChatScreen } from './Navigation/stackNavigation';
export { CallComponent as MirrorflyCallComponent } from './calls/CallComponent';
export { initiateMirroflyCall } from './Helper/Calls/Utility';
export { setNotificationForegroundService } from './calls/notification/callNotifyHandler';
export {
   mirrorflyInitialize,
   mirrorflyNotificationHandler,
   mirrorflyProfileUpdate,
   mirrorflyRegister,
   setAppConfig,
   setupCallScreen,
} from './uikitMethods';
import SDK from './SDK/SDK';
export { SDK };
