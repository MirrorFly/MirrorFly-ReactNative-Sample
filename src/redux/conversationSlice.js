// import { createSlice } from '@reduxjs/toolkit';
// import { v4 as uuidv4 } from 'uuid';
// import {
//   getChatHistoryData,
//   getUpdatedHistoryData,
// } from '../Helper/Chat/ChatHelper';
// import { StateToObj } from './reduxHelper';
// import { changeTimeFormatWithMs } from '../common/TimeStamp';

// const initialState = {
//   id: uuidv4(),
//   data: [],
// };

// const conversationData = createSlice({
//   name: 'conversationData',
//   initialState,
//   reducers: {
//     addChatConversationHistory: (_state, payload) => {
//       // console.log('store conversationData', Date.now())
//       console.log('\n\nPERF CHECK: 1', changeTimeFormatWithMs(), '\n\n');
//       const data = getChatHistoryData(payload.payload, _state.data);
//       console.log('\n\nPERF CHECK: 2', changeTimeFormatWithMs(), '\n\n');
//       return {
//         id: Date.now(),
//         data: data,
//       };
//     },
//     updateChatConversationHistory: (_state, payload) => {
//       return {
//         ..._state,
//         id: uuidv4(),
//         data: getUpdatedHistoryData(payload.payload, StateToObj(_state).data),
//       };
//     },
//   },
// });

// export default conversationData.reducer;
// export const addChatConversationHistory =
//   conversationData.actions.addChatConversationHistory;
// export const updateChatConversationHistory =
//   conversationData.actions.updateChatConversationHistory;
