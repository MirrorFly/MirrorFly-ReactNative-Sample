import React from 'react';
import { FlatList, View } from 'react-native';
import commonStyles from '../common/commonStyles';
import GalleryHeader from '../components/GalleryHeader';

const GalleryPhotos = (props = {}) => {
   const {
      setCheckbox,
      checkBox,
      selectedImages,
      setLocalNav,
      renderItem,
      handleLoadMore,
      photos,
      renderFooter,
      grpView,
      handleBackBtn,
   } = props;

   const getTitle = () => {
      if (selectedImages.length) {
         return selectedImages.length + '/10 Selected';
      } else if (checkBox) {
         return 'Tap Photo to select';
      } else {
         return grpView;
      }
   };

   const renderTitle = React.useMemo(() => {
      return (
         <GalleryHeader
            title={getTitle()}
            setCheckbox={setCheckbox}
            checkBox={checkBox}
            selectedImages={selectedImages}
            setLocalNav={setLocalNav}
            onhandleBack={handleBackBtn}
         />
      );
   }, [checkBox, selectedImages]);

   const memoizedData = React.useMemo(() => photos, [photos]);

   return (
      <View>
         {renderTitle}
         <View style={commonStyles.mb_130}>
            <FlatList
               numColumns={3}
               data={memoizedData}
               keyExtractor={(item, index) => item.id + index.toString()}
               horizontal={false}
               showsVerticalScrollIndicator={false}
               onEndReached={handleLoadMore}
               onEndReachedThreshold={16}
               ListFooterComponent={renderFooter}
               bounces={true}
               renderItem={renderItem}
               initialNumToRender={20}
               maxToRenderPerBatch={20}
               windowSize={15}
            />
         </View>
      </View>
   );
};

export default GalleryPhotos;
