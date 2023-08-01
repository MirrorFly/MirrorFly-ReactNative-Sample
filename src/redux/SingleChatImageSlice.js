
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    "id": uuidv4(),
    "data": {

    },
}

const SingleChatSelectedImageSlice = createSlice({
    name: 'SingleChatSelectedImageSlice',
    initialState,
    reducers: {
        singleChatSelectedMediaImage: (_state, payload) => {
          
            return {
                "id": uuidv4(),
                "data": payload.payload,
            }
        }, resetSingleChatSelectedMediaImage: (_state, payload) => {
            return initialState;
        }
    }
});

export default SingleChatSelectedImageSlice.reducer;
export const singleChatSelectedMediaImage = SingleChatSelectedImageSlice.actions.singleChatSelectedMediaImage;
export const resetSingleChatSelectedMediaImage = SingleChatSelectedImageSlice.actions.resetSingleChatSelectedMediaImage;