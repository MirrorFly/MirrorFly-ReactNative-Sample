import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    galleryAlbum: [],
    galleryPhotos: [],
    galleryName: ""
}

const galleryDataSlice = createSlice({
    name: 'galleryData',
    initialState,
    reducers: {
        addGalleryAlbum: (_state, payload) => {
            return {
                ..._state,
                galleryAlbum: payload.payload
            }
        }, addGalleryPhotos: (_state, payload) => {
            return {
                ..._state,
                galleryPhotos: payload.payload
            }
        }, addGalleyGroupName: (_state, payload) => {
            return {
                ..._state,
                galleryName: payload.payload
            }
        }
    }
});

export default galleryDataSlice.reducer
export const addGalleryAlbum = galleryDataSlice.actions.addGalleryAlbum
export const addGalleryPhotos = galleryDataSlice.actions.addGalleryPhotos
export const addGalleyGroupName = galleryDataSlice.actions.addGalleyGroupName
