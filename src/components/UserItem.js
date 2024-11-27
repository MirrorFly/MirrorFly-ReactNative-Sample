import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NickName from '../common/NickName';
import ApplicationColors from '../config/appColors';
import RecentChatAvathar from './RecentChatAvathar';

// {
//    "image": "",
//    "isAdminBlocked": 0,
//    "status": "",
//    "name": "",
//    "nickName": "",
//    "email": "",
//    "mobileNumber": "",
//    "userJid": "uoqg1efv23w92ejgrrla@xmpp-uikit-qa.contus.us",
//    "userId": "uoqg1efv23w92ejgrrla",
//    "colorCode": "#90631d"
//  }

function UserItem({ item, index, searchText }) {
   const { userId = '', status } = item;
   return (
      <>
         <View style={[styles.container]}>
            <View style={styles.avatarContainer}>
               <RecentChatAvathar type={item.chatType} userId={userId} data={item} />
            </View>
            <View style={styles.contentContainer}>
               <NickName
                  userId={userId}
                  style={styles.userName}
                  searchValue={searchText}
                  index={index}
                  data={item}
                  ellipsizeMode="tail"
               />
               <Text>{status}</Text>
            </View>
         </View>
         <View style={styles.divider} />
      </>
   );
}

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
   },
   avatarContainer: {
      marginRight: 10,
   },
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
   },
   nickname: {
      fontWeight: 'bold',
      marginBottom: 5,
   },
   message: {
      color: '#555',
   },
   time: {
      fontSize: 10,
      color: '#1f2937',
   },
   userName: {
      color: '#1f2937',
      fontWeight: 'bold',
      maxWidth: '90%',
   },
   divider: {
      width: '83%',
      height: 1,
      alignSelf: 'flex-end',
      backgroundColor: ApplicationColors.dividerBg,
   },
   lastSentMessageWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '95%',
   },
});

export default React.memo(UserItem);
