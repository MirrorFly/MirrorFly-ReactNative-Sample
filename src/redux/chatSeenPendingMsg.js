// import { createSlice } from '@reduxjs/toolkit';
// import { v4 as uuidv4 } from 'uuid';
// import { StateToObj } from './reduxHelper';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const initialState = {
//   id: uuidv4(),
//   data: [],
// };
// const deleteData = (data, payload) => {
//   const msgIndex = data.findIndex(msg => msg.msgId === payload);
//   if (msgIndex > -1) {
//     data.splice(msgIndex, 1);
//   }
//   return data;
// };

// const chatSeenPendingMsg = createSlice({
//   name: 'chatSeenPendingMsg',
//   initialState,
//   reducers: {
//     addchatSeenPendingMsg: (_state, payload) => {
//       const addedSeen = {
//         ..._state,
//         id: uuidv4(),
//         data: [...StateToObj(_state).data, payload.payload],
//       };
//       AsyncStorage.setItem('pendingSeenStatus', JSON.stringify(addedSeen));
//       return addedSeen;
//     },
//     deleteChatSeenPendingMsg: (_state, payload) => {
//       const deleteSeen = {
//         ..._state,
//         id: uuidv4(),
//         data: deleteData(StateToObj(_state).data, payload.payload),
//       };
//       AsyncStorage.setItem('pendingSeenStatus', JSON.stringify(deleteSeen));
//       return deleteSeen;
//     },
//     removechatSeenPendingMsg: (_state, payload) => {
//       return initialState;
//     },
//   },
// });

// export default chatSeenPendingMsg.reducer;
// export const addchatSeenPendingMsg =
//   chatSeenPendingMsg.actions.addchatSeenPendingMsg;
// export const deleteChatSeenPendingMsg =
//   chatSeenPendingMsg.actions.deleteChatSeenPendingMsg;
// export const removechatSeenPendingMsg =
//   chatSeenPendingMsg.actions.removechatSeenPendingMsg;
