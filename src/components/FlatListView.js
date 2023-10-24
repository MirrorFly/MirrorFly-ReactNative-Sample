import React from 'react';
import Avathar from '../common/Avathar';
import useRosterData from '../hooks/useRosterData';
import SDK from '../SDK/SDK';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import Pressable from '../common/Pressable';

const RenderItem = ({ item, index, onhandlePress }) => {
  let {
    nickName,
    image: imageToken,
    colorCode,
    status,
  } = useRosterData(item?.userId);
  // updating default values
  nickName = nickName || item?.nickName || item?.userId || '';
  imageToken = imageToken || '';
  colorCode = colorCode || SDK.getRandomColorCode();
  status = status || item.status || '';

  const handlePress = () => onhandlePress(item);

  return (
    <React.Fragment key={index}>
      <Pressable onPress={handlePress}>
        <View style={styles.wrapper}>
          <Avathar
            data={nickName}
            profileImage={imageToken}
            backgroundColor={colorCode}
          />
          <View style={[commonStyles.marginLeft_15, commonStyles.flex1]}>
            <Text
              style={styles.nickNameText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {nickName}
            </Text>
            <Text
              style={styles.stautsText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {status}
            </Text>
          </View>
        </View>
      </Pressable>
      <View style={styles.divider} />
    </React.Fragment>
  );
};

export default function FlatListView(props) {
  const renderItem = ({ item, index }) => (
    <RenderItem item={item} index={index} onhandlePress={props.onhandlePress} />
  );

  const renderLoaderIfFetching = () => {
    if (props.isLoading) {
      return (
        <View style={styles.loaderWrapper}>
          <View style={commonStyles.alignItemsCenter}>
            <ActivityIndicator
              size="large"
              color={ApplicationColors.mainColor}
            />
          </View>
        </View>
      );
    }
  };

  return (
    <>
      {renderLoaderIfFetching()}
      <View style={styles.listContainer}>
        <FlatList
          onEndReached={props?.onhandlePagination}
          showsVerticalScrollIndicator={false}
          data={props.data || []}
          renderItem={renderItem}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: ApplicationColors.white,
    flex: 1,
  },
  wrapper: {
    width: '100%',
    marginVertical: 12,
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nickNameText: {
    flexWrap: 'wrap',
    color: '#1f2937',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  stautsText: {
    color: '#4b5563',
    marginVertical: 2,
  },
  divider: {
    width: '83%',
    height: 1,
    alignSelf: 'flex-end',
    backgroundColor: ApplicationColors.dividerBg,
  },
  loaderWrapper: {
    position: 'absolute',
    width: '100%',
    top: 90,
    zIndex: 100,
  },
});
