import React from 'react';
import { ActivityIndicator, Image, SectionList, StyleSheet, View } from 'react-native';
import SDK from '../SDK/SDK';
import { fetchRecentChats, getHasNextRecentChatPage } from '../SDK/utils';
import no_messages from '../assets/no_messages.png';
import Text from '../common/Text';
import { getImageSource } from '../helpers/chatHelpers';
import { getStringSet } from '../localization/stringSet';
import {
   useArchive,
   useArchivedChatData,
   useFilteredRecentChatData,
   useRecentChatSearchText,
   useThemeColorPalatte,
} from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ArchivedChat from './ArchivedChat';
import RecentChatItem from './RecentChatItem';

const RecentChat = () => {
   const stringSet = getStringSet();
   const archive = useArchive();
   const themeColorPalatte = useThemeColorPalatte();
   const searchText = useRecentChatSearchText();
   const recentChatData = useFilteredRecentChatData() || [];
   const recentArchiveChatData = useArchivedChatData() || [];
   const [filteredMessages, setFilteredMessages] = React.useState([]);
   const [isFetchingData, setIsFetchingData] = React.useState(true);

   React.useEffect(() => {
      initFunc();
   }, []);

   const initFunc = async () => {
      if (!searchText && getHasNextRecentChatPage()) {
         await fetchRecentChats();
      }
      setIsFetchingData(false);
   };

   const handleLoadMore = async () => {
      if (!searchText && !isFetchingData && getHasNextRecentChatPage()) {
         setIsFetchingData(true);
         await fetchRecentChats().then(() => {
            setIsFetchingData(false);
         });
         SDK.messageSearch(searchText).then(res => {
            if (res.statusCode === 200) {
               setFilteredMessages(res.data);
            }
         });
      }
   };

   const renderItem = ({ item, index }) => (
      <RecentChatItem key={item.userJid} item={item} index={index} stringSet={stringSet} />
   );

   const renderSectionHeaderBasedOnCondition = section => {
      const baseTextColor = commonStyles.textColor(themeColorPalatte.primaryTextColor);

      switch (section.title) {
         case stringSet.SETTINGS_SCREEN.CHATS_LABEL:
            return (
               <View style={styles.chatsSearchSubHeader}>
                  <Text style={[styles.chatsSearchSubHeaderText, baseTextColor]}>{section.title}</Text>
                  <Text style={[styles.chatsSearchSubHeaderCountText, baseTextColor]}>({recentChatData.length})</Text>
               </View>
            );

         case 'Messages':
            if (!filteredMessages.length) {
               return null;
            }

            return (
               <View style={styles.chatsSearchSubHeader}>
                  <Text style={[styles.chatsSearchSubHeaderText, baseTextColor]}>{section.title}</Text>
                  <Text style={[styles.chatsSearchSubHeaderCountText, baseTextColor]}>({filteredMessages.length})</Text>
               </View>
            );

         default:
            return null;
      }
   };

   const renderSectionHeader = ({ section }) => (searchText ? renderSectionHeaderBasedOnCondition(section) : null);

   const DATA = [
      {
         title: stringSet.SETTINGS_SCREEN.CHATS_LABEL,
         data: recentChatData,
      },
      {
         title: 'Messages',
         data: filteredMessages,
      },
   ];

   const renderHeader = React.useMemo(() => {
      if (recentArchiveChatData.length && Boolean(archive) && !searchText) {
         return <ArchivedChat />;
      }
   }, [searchText, archive, recentArchiveChatData]);

   const renderFooter = React.useMemo(() => {
      return (
         <View style={commonStyles.marginBottom_10}>
            {Boolean(recentArchiveChatData.length) && !archive && !searchText && <ArchivedChat />}
            {isFetchingData && (
               <View style={commonStyles.marginBottom_10}>
                  <ActivityIndicator size="large" color={themeColorPalatte.primaryColor} />
               </View>
            )}
         </View>
      );
   }, [searchText, archive, isFetchingData, recentArchiveChatData, themeColorPalatte]);

   const renderSectionList = React.useMemo(
      () => (
         <SectionList
            sections={DATA}
            keyExtractor={item => item.userJid}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            onEndReached={handleLoadMore}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            scrollEventThrottle={100}
            windowSize={20}
            onEndReachedThreshold={0.1}
            disableVirtualization={true}
            maxToRenderPerBatch={20}
         />
      ),
      [recentChatData, filteredMessages, archive, searchText, isFetchingData, stringSet],
   );

   if (!isFetchingData && !recentChatData.length && !filteredMessages.length && !recentArchiveChatData.length) {
      return (
         <View style={[styles.emptyChatView, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}>
            <Image style={styles.image} resizeMode="cover" source={getImageSource(no_messages)} />
            {searchText ? (
               <Text style={[styles.noMsg, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                  {stringSet.COMMON_TEXT.NO_RESULTS_FOUND}
               </Text>
            ) : (
               <>
                  <Text style={[styles.noMsg, commonStyles.textColor(themeColorPalatte.primaryTextColor)]}>
                     {stringSet.COMMON_TEXT.NO_NEW_MESSAGES}
                  </Text>
                  <Text>{stringSet.COMMON_TEXT.ANY_MESSAGES_APPEAR_HERE}</Text>
               </>
            )}
         </View>
      );
   }

   return (
      <View style={[styles.container, commonStyles.bg_color(themeColorPalatte.screenBgColor)]}>
         {renderSectionList}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
   },
   image: {
      width: 200,
      height: 200,
   },
   noMsg: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 8,
   },
   emptyChatView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   chatsSearchSubHeader: {
      flexDirection: 'row',
      width: '100%',
      paddingVertical: 10,
      backgroundColor: '#E5E5E5',
   },
   chatsSearchSubHeaderText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '500',
   },
   chatsSearchSubHeaderCountText: {
      marginLeft: 2,
      fontSize: 16,
      fontWeight: '700',
   },
});

export default RecentChat;
