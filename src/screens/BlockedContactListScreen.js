import React from 'react';
import { FlatList, Text, View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import UserAvatharNickname from '../common/UserAvatharNickname';
import { useBlockedList } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

function BlockedContactListScreen() {
   const filterList = useBlockedList();
   const renderItem = ({ item, index }) => <UserAvatharNickname item={item} index={index} />;

   return (
      <View style={[commonStyles.flex1, commonStyles.bg_white]}>
         <ScreenHeader title="Blocked Contact List" isSearchable={false} />
         <FlatList
            keyboardShouldPersistTaps={'always'}
            keyExtractor={item => item?.userId}
            showsVerticalScrollIndicator={true}
            data={filterList || []}
            renderItem={renderItem}
            initialNumToRender={23}
            maxToRenderPerBatch={23}
            windowSize={15}
            ListEmptyComponent={
               <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.flex1]}>
                  <Text style={[commonStyles.justifyContentCenter, commonStyles.fontSize_18]}>
                     No Blocked Contact found
                  </Text>
               </View>
            }
            contentContainerStyle={commonStyles.flexGrow1}
         />
      </View>
   );
}

export default React.memo(BlockedContactListScreen);
