import React from 'react';
import GalleryHeader from '../components/GalleryHeader';
import { BackHandler, FlatList, View } from 'react-native';
import commonStyles from '../common/commonStyles';
import { selectedMediaIdRef } from './ChatScreen';

const GalleryPhotos = (props = {}) => {
  const {
    setCheckbox,
    checkBox,
    selectedImages,
    setPhotos,
    setLocalNav,
    renderItem,
    handleLoadMore,
    photos,
    renderFooter,
    setGrpView,
    grpView,
    setSelectedImages,
  } = props;

  const handleBackBtn = () => {
    if (!checkBox && selectedImages.length) {
      setSelectedImages([]);
      selectedMediaIdRef.current = {};
    } else if (checkBox) {
      setCheckbox(false);
    } else if (grpView) {
      setPhotos([]);
      setGrpView('');
    }
    return true;
  };

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackBtn,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

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
