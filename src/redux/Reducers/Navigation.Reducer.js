import { NAVIGATION_NAVIGATE } from '../Actions/Constants';
import {
  PROFILESCREEN,
  RECENTCHATSCREEN,
  REGISTERSCREEN,
} from '../../constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  screen: REGISTERSCREEN,
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
      const updatedState = { ...state };
      updatedState.screen = action.payload?.screen;
      updatedState.number = action.payload?.number;
      updatedState.fromUserJid = action.payload?.fromUserJID;
      updatedState.selectContryCode =
        action?.payload?.selectContryCode || updatedState.selectContryCode;
      updatedState.prevScreen = action?.payload.prevScreen;
      updatedState.profileDetails = action?.payload?.profileDetails;
      return updatedState;
    } catch (error) {
      console.log('NavigationReducer', error);
    }
  } else {
    return state;
  }
};

export default NavigationReducer;
