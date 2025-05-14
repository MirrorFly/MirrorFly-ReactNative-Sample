import { createSlice } from '@reduxjs/toolkit';
import { clearState } from './clearSlice';

let prevVibrateStatus = false;

const initialState = {
   notificationSound: true,
};

const settingDataSlice = createSlice({
   name: 'settingDataData',
   initialState,
   reducers: {
      toggleArchiveSetting(state, action) {
         state['archive'] = action.payload;
      },
      toggleNotificationDisabled(state, action) {
         state['muteNotification'] = action.payload;
         state['notificationSound'] = !action.payload;
         if (action.payload) {
            prevVibrateStatus = false;
            state['notificationVibrate'] = prevVibrateStatus;
         } else {
            state['notificationVibrate'] = prevVibrateStatus;
         }
      },
      toggleNotificationSound(state, action) {
         state['muteNotification'] = false;
         state['notificationSound'] = action.payload;
      },
      toggleNotificationVibrate(state, action) {
         state['notificationSound'] = state['muteNotification'] ? action.payload : state['notificationSound'];
         state['muteNotification'] = false;
         prevVibrateStatus = action.payload;
         state['notificationVibrate'] = action.payload;
      },
      updateNotificationSetting(state, action) {
         Object.keys(action.payload).forEach(key => {
            state[key] = action.payload[key];
         });
      },
   },
   extraReducers: builder => {
      builder.addCase(clearState, () => initialState);
   },
});

export const {
   toggleArchiveSetting,
   toggleNotificationDisabled,
   toggleNotificationSound,
   toggleNotificationVibrate,
   updateNotificationSetting,
} = settingDataSlice.actions;
export default settingDataSlice.reducer;
