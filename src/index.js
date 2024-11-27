export { MirrorflyComponent } from '../App';
export { initiateMirroflyCall } from './Helper/Calls/Utility';
export { ChatScreen } from './Navigation/stackNavigation';
export { CallComponent as MirrorflyCallComponent } from './calls/CallComponent';
export { setNotificationForegroundService } from './calls/notification/callNotifyHandler';
export {
   mirrorflyInitialize,
   mirrorflyNotificationHandler,
   mirrorflyProfileUpdate,
   mirrorflyRegister,
   setAppConfig,
   setupCallScreen
} from './uikitMethods';
export { SDK };
import SDK from './SDK/SDK';

