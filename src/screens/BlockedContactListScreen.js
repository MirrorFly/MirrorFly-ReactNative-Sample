import React from 'react';
import { FlatList, Text, View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import UserAvatharNickname from '../common/UserAvatharNickname';
import { useRoasterList } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function BlockedContactListScreen() {
   const roasterData = useRoasterList();
   const roasterList = Object.values(roasterData);
   const filterList = roasterList.filter(u => u.isBlocked);
   const renderItem = ({ item, index }) => <UserAvatharNickname item={item} index={index} />;

   const renderList = () => {
      if (filterList.length) {
         return (
            <FlatList
               keyboardShouldPersistTaps={'always'}
               keyExtractor={item => item?.userId}
               showsVerticalScrollIndicator={true}
               data={filterList || []}
               renderItem={renderItem}
               initialNumToRender={23}
               maxToRenderPerBatch={23}
               windowSize={15}
            />
         );
      } else {
         return (
            <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.flex1]}>
               <Text style={[commonStyles.justifyContentCenter, commonStyles.fontSize_18]}>
                  No Blocked Contact found
               </Text>
            </View>
         );
      }
   };

   return (
      <View style={[commonStyles.flex1, commonStyles.bg_white]}>
         <ScreenHeader title="Blocked Contact List" isSearchable={false} />
         {renderList()}
      </View>
   );
}

export default React.memo(BlockedContactListScreen);
