import React from 'react';
import { ActivityIndicator, Image, SectionList, StyleSheet, Text, View } from 'react-native';
import { fetchRecentChats, getHasNextRecentChatPage } from '../SDK/utils';
import no_messages from '../assets/no_messages.png';
import ApplicationColors from '../config/appColors';
import { getImageSource } from '../helpers/chatHelpers';
import {
   useArchive,
   useArchivedChatData,
   useFilteredRecentChatData,
   useRecentChatSearchText,
} from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ArchivedChat from './ArchivedChat';
import RecentChatItem from './RecentChatItem';

const RecentChat = () => {
   const archive = useArchive();
   const searchText = useRecentChatSearchText();
   const recentChatData = useFilteredRecentChatData() || [];
   const recentArchiveChatData = useArchivedChatData() || [];
   const [filteredMessages, setFilteredMessages] = React.useState([]);
   const [isFetchingData, setIsFetchingData] = React.useState(true);

   React.useEffect(() => {
      initFunc();
   }, []);

   const initFunc = async () => {
      await fetchRecentChats();
      setIsFetchingData(false);
   };

   const handleLoadMore = async () => {
      if (!searchText && !isFetchingData && getHasNextRecentChatPage()) {
         setIsFetchingData(true);
         await fetchRecentChats().then(() => {
            setIsFetchingData(false);
         });
      }
   };

   const renderItem = ({ item, index }) => <RecentChatItem key={item.userJid} item={item} index={index} />;

   const renderSectionHeaderBasedOnCondition = section => {
      switch (section.title) {
         case 'Chats':
            return (
               <View style={styles.chatsSearchSubHeader}>
                  <Text style={styles.chatsSearchSubHeaderText}>{section.title}</Text>
                  <Text style={styles.chatsSearchSubHeaderCountText}>({recentChatData.length})</Text>
               </View>
            );
         case 'Messages':
            return (
               Boolean(filteredMessages.length) && (
                  <View style={styles.chatsSearchSubHeader}>
                     <Text style={styles.chatsSearchSubHeaderText}>{section.title}</Text>
                     <Text style={styles.chatsSearchSubHeaderCountText}>({filteredMessages.length})</Text>
                  </View>
               )
            );
      }
   };

   const renderSectionHeader = ({ section }) => (searchText ? renderSectionHeaderBasedOnCondition(section) : null);

   const DATA = [
      {
         title: 'Chats',
         data: recentChatData,
      },
      {
         title: 'Messages',
         data: filteredMessages,
      },
   ];

   const renderHeader = React.useMemo(() => {
      if (recentArchiveChatData.length && archive && !searchText) {
         return <ArchivedChat />;
      }
   }, [searchText, archive, recentArchiveChatData]);

   const renderFooter = React.useMemo(() => {
      return (
         <View style={commonStyles.marginBottom_10}>
            {Boolean(recentArchiveChatData.length) && !archive && !searchText && <ArchivedChat />}
            {isFetchingData && (
               <View style={commonStyles.mb_130}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </View>
      );
   }, [searchText, archive, isFetchingData]);

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
            scrollEventThrottle={1}
            windowSize={20}
            onEndReachedThreshold={0.1}
            disableVirtualization={true}
            maxToRenderPerBatch={20}
         />
      ),
      [recentChatData, filteredMessages, archive, searchText, isFetchingData],
   );

   if (!isFetchingData && !recentChatData.length && !filteredMessages.length) {
      return (
         <View style={styles.emptyChatView}>
            <Image style={styles.image} resizeMode="cover" source={getImageSource(no_messages)} />
            {searchText ? (
               <Text style={styles.noMsg}>No Result Found</Text>
            ) : (
               <>
                  <Text style={styles.noMsg}>No New Messages</Text>
                  <Text>Any new messages will appear here</Text>
               </>
            )}
         </View>
      );
   }

   return <View style={styles.container}>{renderSectionList}</View>;
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
      color: '#181818',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 8,
   },
   emptyChatView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ApplicationColors.white,
   },
   chatsSearchSubHeader: {
      flexDirection: 'row',
      width: '100%',
      paddingVertical: 10,
      backgroundColor: '#E5E5E5',
   },
   chatsSearchSubHeaderText: {
      marginLeft: 8,
      color: '#181818',
      fontSize: 16,
      fontWeight: '500',
   },
   chatsSearchSubHeaderCountText: {
      color: '#181818',
      marginLeft: 2,
      fontSize: 16,
      fontWeight: '800',
   },
});

export default RecentChat;
