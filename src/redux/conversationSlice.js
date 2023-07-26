import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { getChatHistoryData, getUpdatedHistoryData, getUpdatedHistoryDataUpload, updateMediaUploadStatusHistory } from "../Helper/Chat/ChatHelper";
import { StateToObj } from "./reduxHelper";

const initialState = {
    "id": uuidv4(),
    "data": []
}

const conversationData = createSlice({
    name: 'conversationData',
    initialState,
    reducers: {
        addChatConversationHistory: (_state, payload) => {
            return {
                "id": uuidv4(),
                "data": getChatHistoryData(payload.payload, _state.data)
            }
        }, updateChatConversationHistory: (_state, payload) => {
            return {
                ..._state,
                "id": uuidv4(),
                "data": getUpdatedHistoryData(payload.payload, StateToObj(_state).data)
            }
        }, updateUploadStatus: (_state, payload) => {
            return {
                ..._state,
                "id": uuidv4(),
                "data": getUpdatedHistoryDataUpload(payload.payload, StateToObj(_state).data)
            }
        }, RetryMediaUpload: (_state, payload) => {
            return {
                "id": uuidv4(),
                "data": updateMediaUploadStatusHistory(payload.payload, StateToObj(_state).data)
            }
        }, CancelMediaUpload: (_state, payload) => {
            return {
                "id": uuidv4(),
                "data": updateMediaUploadStatusHistory(payload.payload, StateToObj(_state).data)
            }
        },
    }
});

export default conversationData.reducer
export const addChatConversationHistory = conversationData.actions.addChatConversationHistory
export const updateChatConversationHistory = conversationData.actions.updateChatConversationHistory
export const updateUploadStatus = conversationData.actions.updateUploadStatus
export const RetryMediaUpload = conversationData.actions.RetryMediaUpload
export const CancelMediaUpload = conversationData.actions.CancelMediaUpload