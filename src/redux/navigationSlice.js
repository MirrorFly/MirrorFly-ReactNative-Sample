// import { createSlice } from '@reduxjs/toolkit';
// import { PROFILESCREEN, RECENTCHATSCREEN, REGISTERSCREEN } from '../constant';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const initialState = {
//     screen: REGISTERSCREEN,
//     fromUserJid: '',
//     number: '',
//     status: 'idle',
//     error: null,
//     selectContryCode: {
//         name: "India",
//         dial_code: "91",
//         code: "IN"
//     },
//     prevScreen: "",
//     profileDetails: {}
// };

// const navigationSlice = createSlice({
//     name: 'navigateSlice',
//     initialState: initialState,
//     reducers: {
//         navigate: (state, action) => {
//             const validScreens = [REGISTERSCREEN, PROFILESCREEN, RECENTCHATSCREEN];
//             const { screen, prevScreen } = action.payload || {};
//             if (validScreens.includes(screen)) {
//                 AsyncStorage.setItem('screenObj', JSON.stringify(action.payload));
//                 if (screen === PROFILESCREEN) {
//                     if (prevScreen === REGISTERSCREEN) {
//                         AsyncStorage.setItem('screenObj', JSON.stringify(action.payload));
//                     } else if (prevScreen === RECENTCHATSCREEN) {
//                         AsyncStorage.setItem('screenObj', JSON.stringify({ prevScreen: '', screen: RECENTCHATSCREEN }));
//                     }
//                 }
//             }
//             state.screen = action.payload?.screen;
//             state.number = action.payload?.number;
//             state.fromUserJid = action.payload?.fromUserJID;
//             state.selectContryCode = action?.payload?.selectContryCode || state.selectContryCode;
//             state.prevScreen = action?.payload.prevScreen;
//             state.profileDetails = action?.payload?.profileDetails
//         }
//     },
// });

// export const { navigate } = navigationSlice.actions;

// export default navigationSlice.reducer;
