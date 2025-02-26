import { createSelector, createSlice } from '@reduxjs/toolkit';
import { isObjectChanged } from '../config/appColors';

const defaultTheme = {
   light: {
      modalOverlayBg: 'rgba(0,0,0,.5)',
      white: 'white',
      black: 'black',
      pressedBg: 'rgba(0, 0, 0, 0.1)',
      secondaryPressedBg: 'rgba(128, 128, 128, 0.5)',
      modalTextColor: '#767676',
      highlighedMessageBg: 'rgba(0,0,0,0.2)',
      shadowColor: '#181818',
      groupNotificationBgColour: '#DADADA',
      groupNotificationTextColour: '#565656',
      timeStampText: '#455E93',
      iconColor: '#181818',
      primaryColor: '#3276E2',
      headerPrimaryTextColor: '#181818',
      headerSecondaryTextColor: '#959595',
      primaryTextColor: '#181818',
      secondaryTextColor: '#767676',
      screenBgColor: '#fff',
      placeholderTextColor: '#d3d3d3',
      appBarColor: '#F2F2F2',
      dividerBg: '#E2E2E2',
      mainBorderColor: '#C1C1C1',
      colorOnPrimary: '#fff',
      chatSenderPrimaryColor: '#E2E8F7',
      chatSenderSecondaryColor: '#D0D8EB',
      chatSenderPrimaryTextColor: '#313131',
      chatSenderSecondaryTextColor: '#455E93',
      chatReceiverPrimaryColor: '#fff',
      chatReceiverSecondaryColor: '#EFEFEF',
      chatReceiverPrimaryTextColor: '#313131',
      chatReceiverSecondaryTextColor: '#959595',
   },
   dark: {
      modalOverlayBg: 'rgba(0,0,0,.5)',
      white: 'white',
      black: 'black',
      pressedBg: '#414141',
      secondaryPressedBg: 'rgba(128, 128, 128, 0.5)',
      modalTextColor: '#767676',
      highlighedMessageBg: '#414141',
      shadowColor: '#181818',
      groupNotificationBgColour: '#DADADA',
      groupNotificationTextColour: '#565656',
      timeStampText: '#455E93',
      iconColor: '#fff',
      primaryColor: '#3276E2',
      headerPrimaryTextColor: '#FFFFFF',
      headerSecondaryTextColor: '#767676',
      primaryTextColor: '#FFFFFF',
      secondaryTextColor: '#767676',
      screenBgColor: '#181818',
      placeholderTextColor: '#d3d3d3',
      appBarColor: '#2a2a2a',
      dividerBg: '#E2E2E2',
      mainBorderColor: '#C1C1C1',
      colorOnPrimary: '#fff',
      chatSenderPrimaryColor: '#E2E8F7',
      chatSenderSecondaryColor: '#D0D8EB',
      chatSenderPrimaryTextColor: '#313131',
      chatSenderSecondaryTextColor: '#455E93',
      chatReceiverPrimaryColor: '#fff',
      chatReceiverSecondaryColor: '#EFEFEF',
      chatReceiverPrimaryTextColor: '#313131',
      chatReceiverSecondaryTextColor: '#959595',
   },
};

const initialState = {
   id: null,
   theme: 'light',
   fontFamily: {},
   ...defaultTheme,
};

const themeColorDataSlice = createSlice({
   name: 'themeColorData',
   initialState,
   reducers: {
      updateThemeColor(state, action) {
         if (!isObjectChanged(state.light, action.payload)) {
            return;
         }
         state.light = {
            ...state.light,
            ...action.payload,
         };
      },
      updateTheme(state, action) {
         state.theme = action.payload;
      },
      updateFontFamily(state, action) {
         state.fontFamily = action.payload;
      },
   },
});

export const { updateThemeColor, updateTheme, updateFontFamily } = themeColorDataSlice.actions;
export default themeColorDataSlice.reducer;

// Selectors
export const selectThemeData = state => state.themeColorPalatte;
export const selectTheme = state => state.themeColorPalatte.theme;

export const selectFilteredThemeData = createSelector([selectThemeData, selectTheme], (data, theme) => {
   if (theme === 'light') {
      return data.light;
   }
   if (theme === 'dark') {
      return data.dark;
   }
});
