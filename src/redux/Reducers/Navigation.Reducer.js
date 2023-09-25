import { NAVIGATION_NAVIGATE } from '../Actions/Constants';
import {
  PROFILESCREEN,
  RECENTCHATSCREEN,
  REGISTERSCREEN,
} from '../../constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  screen: REGISTERSCREEN,
  notificationCheck: '',
  fromUserJid: '',
  number: '',
  status: 'idle',
  error: null,
  selectContryCode: {
    name: 'India',
    dial_code: '91',
    code: 'IN',
  },
  prevScreen: '',
  profileDetails: {},
};

const NavigationReducer = (state = initialState, action) => {
  if (action.type === NAVIGATION_NAVIGATE) {
    const validScreens = [REGISTERSCREEN, PROFILESCREEN, RECENTCHATSCREEN];
    try {
      const { screen, prevScreen } = action.payload || {};
      if (validScreens.includes(screen)) {
        AsyncStorage.setItem('screenObj', JSON.stringify(action.payload));
        if (screen === PROFILESCREEN) {
          if (prevScreen === REGISTERSCREEN) {
            AsyncStorage.setItem('screenObj', JSON.stringify(action.payload));
          } else if (prevScreen === RECENTCHATSCREEN) {
            AsyncStorage.setItem(
              'screenObj',
              JSON.stringify({ prevScreen: '', screen: RECENTCHATSCREEN }),
            );
          }
        }
      }
      const updatedState = {
        ...state,
      };
      if (action.payload?.screen) {
        updatedState.screen = action.payload?.screen;
      }
      if (action.payload?.number) {
        updatedState.number = action.payload?.number;
      }
      if (action?.payload?.fromUserJID || action.payload?.fromUserJID === '') {
        updatedState.fromUserJid = action.payload?.fromUserJID;
      }
      if (action?.payload?.selectContryCode || updatedState.selectContryCode) {
        updatedState.selectContryCode =
          action?.payload?.selectContryCode || updatedState.selectContryCode;
      }
      if (action?.payload.prevScreen) {
        updatedState.prevScreen = action?.payload.prevScreen;
      }
      if (action?.payload?.profileDetails) {
        updatedState.profileDetails = action?.payload?.profileDetails;
      }
      if (action?.payload?.notificationCheck) {
        updatedState.notificationCheck = action?.payload?.notificationCheck;
      }
      return updatedState;
    } catch (error) {
      console.log('NavigationReducer', error);
    }
  } else {
    return state;
  }
};

export default NavigationReducer;
