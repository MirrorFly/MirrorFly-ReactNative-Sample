import React from 'react';
import { ActivityIndicator, FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import RootNavigation from '../Navigation/rootNavigation';
import { randomString } from '../SDK/utils';
import { FrontArrowIcon, LinkIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import ApplicationColors from '../config/appColors';
import { findUrls, getUserIdFromJid, handleReplyPress } from '../helpers/chatHelpers';
import { currentChatUser } from '../screens/ConversationScreen';
import commonStyles from '../styles/commonStyles';

function LinksTab({ linksMessage, loading }) {
   const renderDocFooter = () => {
      return (
         <>
            {linksMessage.length > 0 && <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>{}</Text>}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const extractDomain = url => {
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
      return match && match[1] ? match[1] : null; // Extracts "chatgpt.com" from URL
   };

   const renderLinkTile = ({ item }) => {
      const { msgId, deleteStatus = 0, recallStatus = 0, msgBody: { message = '' } = {} } = item;

      const handlePress = content => () => {
         Linking.openURL(content);
      };

      const handleMessagePress = () => {
         RootNavigation.popToTop();
         setTimeout(() => {
            handleReplyPress(getUserIdFromJid(currentChatUser), msgId, item);
         }, 500);
      };

      if (deleteStatus !== 0 || recallStatus !== 0) {
         return null;
      }

      const segmants = findUrls(message);

      return segmants.map(
         segmant =>
            segmant.isUrl && (
               <React.Fragment key={randomString()}>
                  <View style={styles.linkTile}>
                     <Pressable onPress={handlePress(segmant.content)} contentContainerStyle={[commonStyles.hstack]}>
                        <View
                           style={[styles.linkIcon, commonStyles.alignItemsCenter, commonStyles.justifyContentCenter]}>
                           <LinkIcon />
                        </View>
                        <View style={{ backgroundColor: '#D0D8EB', padding: 10 }}>
                           <Text style={styles.segmantContent}>{segmant.content}</Text>
                           <Text style={styles.domainName}>{extractDomain(segmant.content)}</Text>
                        </View>
                     </Pressable>
                     <Pressable
                        onPress={handleMessagePress}
                        contentContainerStyle={[
                           commonStyles.hstack,
                           commonStyles.alignItemsCenter,
                           commonStyles.paddingHorizontal_6,
                        ]}>
                        <Text
                           numberOfLines={1}
                           ellipsizeMode="tail"
                           style={[styles.message, { flex: 1, overflow: 'hidden' }]}>
                           {message}
                        </Text>
                        <FrontArrowIcon color="#7889B3" />
                     </Pressable>
                  </View>
                  <View style={[commonStyles.dividerLine, { marginVertical: 10 }]} />
               </React.Fragment>
            ),
      );
   };

   return (
      <FlatList
         showsVerticalScrollIndicator={false}
         data={linksMessage}
         keyExtractor={item => item.msgId}
         bounces={false}
         renderItem={renderLinkTile}
         ListFooterComponent={renderDocFooter}
         initialNumToRender={20}
         maxToRenderPerBatch={20}
         windowSize={15}
      />
   );
}

export default React.memo(LinksTab);

const styles = StyleSheet.create({
   linkTile: {
      backgroundColor: '#E2E8F7',
      borderRadius: 6,
      overflow: 'hidden',
   },
   linkIcon: {
      backgroundColor: '#97A5C7',
      padding: 20,
      borderTopLeftRadius: 6,
      borderBottomLeftRadius: 6,
   },
   domainName: {
      paddingVertical: 5,
      color: '#111111',
      fontSize: 8,
   },
   message: {
      paddingVertical: 4,
      fontSize: 12,
      color: '#7889B3',
   },
   segmantContent: {
      fontSize: 12,
      color: 'black',
   },
});
