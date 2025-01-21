import store from '../redux/store';
import { updateTheme } from '../redux/themeColorDataSlice';
import { RealmKeyValueStore } from '../SDK/SDK';

const ApplicationColors = {
   mainColor: '#3276E2',
   modalOverlayBg: 'rgba(0,0,0,.5)',
   mainbg: 'white',
   mainBorderColor: '#C1C1C1',
   invertedBg: 'black',
   white: 'white',
   black: 'black',
   pressedBg: 'rgba(0, 0, 0, 0.1)',
   secondaryPressedBg: 'rgba(128, 128, 128, 0.5)',
   headerBg: '#F2F2F2',
   dividerBg: '#E2E2E2',
   modalTextColor: '#767676',
   highlighedMessageBg: 'rgba(0,0,0,0.2)',
   sentMessageBg: '#E2E8F7',
   receivedMessageBg: '#FFFFFF',
   shadowColor: '#181818',
   groupNotificationBgColour: '#DADADA',
   groupNotificationTextColour: '#565656',
   placeholderTextColor: '#d3d3d3',
   timeStampText: '#455E93',
};

export default ApplicationColors;

export const isObjectChanged = (original, response) => {
   for (let key in response) {
      if (original[key] !== response[key]) {
         return true; // A change is detected
      }
   }
   return false; // No change
};

export const setTheme = (theme = 'light') => {
   store.dispatch(updateTheme(theme));
   RealmKeyValueStore.setItem('theme', theme);
};
