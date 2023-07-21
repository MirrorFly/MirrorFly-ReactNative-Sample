import React from 'react'
import GalleryHeader from '../components/GalleryHeader'
import { BackHandler, FlatList } from 'react-native'
import { View } from 'native-base'

const GalleryPhotos = (props = {}) => {
    const { setCheckbox, checkBox, selectedImages,setPhotos,
        renderItem, handleLoadMore, photos, renderFooter, setGrpView, grpView, setSelectedImages } = props

    const handleBackBtn = () => {
        if (!checkBox && selectedImages.length) {
            setSelectedImages([])
        } else if (checkBox) {
            setCheckbox(false)
        } else if (grpView) {
            setPhotos([])
            setGrpView('');
        }
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    React.useEffect(() => {
        return () => {
            backHandler.remove();
        }
    }, [])

    const getTitle = () => {
        if (selectedImages.length) {
            return selectedImages.length + "/10 Selected"
        } else if (checkBox) {
            return "Tap Photo to select"
        }
        else {
            return grpView
        }
    }
    
    return (
        <>
            <View >
                <GalleryHeader title={getTitle()}
                    setCheckbox={setCheckbox}
                    checkBox={checkBox}
                    selectedImages={selectedImages}
                    onhandleBack={handleBackBtn} />
                <View mb={16}>
                    <FlatList
                        numColumns={3}
                        data={photos}
                        keyExtractor={(item, index) => item.id + index.toString()}
                        horizontal={false}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={16}
                        ListFooterComponent={renderFooter}
                        bounces={true}
                        renderItem={renderItem}
                    />
                </View>
            </View>
        </>
    )
}

export default GalleryPhotos