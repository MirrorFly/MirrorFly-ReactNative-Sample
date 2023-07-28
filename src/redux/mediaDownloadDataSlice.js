import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "id": null,
    "data": {}
}
const mediaDownloadDataSlice = createSlice({
    name: 'mediaDownloadData',
    initialState,
    reducers: {
        updateDownloadData: (_state, payload) => {
            return {
                ..._state,
                ...{
                    "id": uuidv4(),
                    "data": {
                        ..._state.data,
                        [payload.payload.msgId]: payload.payload
                    }
                }
            }
        }
    }
});

export default mediaDownloadDataSlice.reducer
export const updateDownloadData = mediaDownloadDataSlice.actions.updateDownloadData