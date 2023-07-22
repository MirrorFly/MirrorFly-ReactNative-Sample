import { addGalleryAlbum, addGalleryPhotos, addGalleyGroupName } from "./galleryDataSlice"
import store from "./store"

export const clearGalleryData = () => {
    store.dispatch(addGalleryAlbum([]))
    store.dispatch(addGalleryPhotos([]))
    store.dispatch(addGalleyGroupName(''))
} 