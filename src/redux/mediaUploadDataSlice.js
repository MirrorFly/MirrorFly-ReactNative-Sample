import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "id": null,
    "data": {}
}
const mediauploadDataSlice = createSlice({
    name: 'mediauploadData',
    initialState,
    reducers: {
        updateMediaUploadData: (_state, payload) => {
            console.log(payload.payload,"09876543345678");
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

export default mediauploadDataSlice.reducer
export const updateMediaUploadData = mediauploadDataSlice.actions.updateMediaUploadData