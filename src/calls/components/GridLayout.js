import React from 'react';
import { StyleSheet, View, FlatList, Text, Pressable } from 'react-native';
import Avathar from '../../common/Avathar';
import useRosterData from '../../hooks/useRosterData';
import { getUserIdFromJid } from '../../Helper/Chat/Utility';
import ApplicationColors from '../../config/appColors';

const GridItem = ({ wrapperStyle, item, isLocalUser, isFullSize, onPress }) => {
   const userId = getUserIdFromJid(item?.fromJid || '');
   const userProfile = useRosterData(userId);
   const nickName = userProfile.nickName || userId || '';
   return (
      <Pressable style={[wrapperStyle]} onPress={onPress}>
         <View style={styles.gridItem}>
            <View style={styles.gridItemVoiceLevelWrapper}>
               <View style={styles.gridItemVoiceLevelIndicator} />
               <View style={styles.gridItemVoiceLevelIndicator} />
               <View style={styles.gridItemVoiceLevelIndicator} />
            </View>
            <View style={styles.gridItemUserAvathar}>
               <Avathar
                  width={isFullSize ? 100 : 60}
                  height={isFullSize ? 100 : 60}
                  backgroundColor={userProfile.colorCode}
                  data={nickName}
                  profileImage={userProfile.image}
               />
            </View>
            <View>
               <Text numberOfLines={1} ellipsizeMode="tail" style={styles.gridItemUserName}>
                  {isLocalUser ? 'You' : nickName}
               </Text>
            </View>
         </View>
      </Pressable>
   );
};

export const GridLayout = ({ remoteStreams, localUserJid, onPressAnywhere, offsetTop }) => {
   const [scrollViewDimension, setScrollViewDimension] = React.useState({
      width: null,
      height: null,
   });

   const [calculatedColumns, calculatedGridItemStyle] = React.useMemo(() => {
      let { width, height } = scrollViewDimension;
      width = width - 10; // subtracting the horizontal padding for the scroll view content
      const _usersLength = remoteStreams?.length || 0;
      const _calculatedColumns = _usersLength <= 3 ? 1 : 2;
      return [
         _calculatedColumns,
         _calculatedColumns === 1
            ? {
                 width: width - 10, // subtracting the horizontal padding (5 + 5)
                 padding: 5,
                 height: height / _usersLength - 10, // subtracting the vertical padding (5 + 5)
              }
            : {
                 width: width / 2 - 10, // subtracting the horizontal padding (5 + 5)
                 padding: 5,
                 height: width / 2 - 10, // subtracting the vertical padding (5 + 5)
              },
      ];
   }, [remoteStreams?.length, scrollViewDimension]);

   const handleLayout = ({ nativeEvent }) => {
      const { height, width } = nativeEvent.layout;
      setScrollViewDimension({
         width,
         height,
      });
   };

   const renderGridItem = ({ item }) => {
      return (
         <GridItem
            wrapperStyle={calculatedGridItemStyle}
            item={item}
            isLocalUser={item?.fromJid === localUserJid}
            isFullSize={calculatedColumns === 1}
            onPress={onPressAnywhere}
         />
      );
   };

   return (
      <FlatList
         key={calculatedColumns}
         numColumns={calculatedColumns}
         onLayout={handleLayout}
         style={styles.container}
         contentContainerStyle={[
            styles.scrollContentContainer,
            {
               minHeight: scrollViewDimension.height - 100,
            },
         ]}
         data={remoteStreams}
         renderItem={renderGridItem}
         keyExtractor={_user => String(_user.id)}
      />
   );
};

export default GridLayout;

const styles = StyleSheet.create({
   container: {
      flex: 1,
      marginTop: 5,
   },
   scrollContentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 5,
   },
   halfWidth: {
      width: '47%',
      margin: '1.5%',
   },
   fullWidth: {
      width: '97%',
      margin: '1.5%',
   },
   gridItem: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 10,
      borderRadius: 10,
      backgroundColor: '#151F32',
   },
   gridItemVoiceLevelWrapper: {
      backgroundColor: '#3ABF87',
      width: 25,
      height: 25,
      borderRadius: 15,
      alignSelf: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
   gridItemVoiceLevelIndicator: {
      width: 4,
      height: 4,
      borderRadius: 3,
      marginHorizontal: 1,
      backgroundColor: ApplicationColors.white,
   },
   gridItemUserAvathar: {
      alignSelf: 'center',
      marginTop: -10,
   },
   gridItemUserName: {
      color: ApplicationColors.white,
   },
});
