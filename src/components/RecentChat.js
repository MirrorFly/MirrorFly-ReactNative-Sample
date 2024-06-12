import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Image, SectionList, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchRecentChats, getHasNextRecentChatPage } from '../SDK/utils';
import no_messages from '../assets/no_messages.png';
import ApplicationColors from '../config/appColors';
import { getImageSource } from '../helpers/chatHelpers';
import { useFilteredRecentChatData, useRecentChatSearchText } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import ArchivedChat from './ArchivedChat';
import RecentChatItem from './RecentChatItem';

const RecentChat = () => {
   const navigation = useNavigation();
   const dispatch = useDispatch();
   const searchText = useRecentChatSearchText();
   const recentChatData = useFilteredRecentChatData() || [];
   const [filteredMessages, setFilteredMessages] = React.useState([]);
   const [isFetchingData, setIsFetchingData] = React.useState(true);

   React.useEffect(() => {
      initFunc();
   }, []);

   React.useEffect(() => {
      if (searchText) {
         SDK.messageSearch(searchText).then(res => {
            if (res.statusCode === 200) {
               setFilteredMessages(res.data);
            }
         });
      }
   }, [searchText]);

   const initFunc = async () => {
      await fetchRecentChats();
      setIsFetchingData(false);
   };

   const handleLoadMore = async () => {
      console.log('handleLoadMore');
      if (!searchText && !isFetchingData && getHasNextRecentChatPage()) {
         setIsFetchingData(true);
         await fetchRecentChats().then(() => {
            setIsFetchingData(false);
         });
      }
   };

   const renderFooterLoaderIfFetching = () => {
      if (isFetchingData) {
         return (
            <View style={commonStyles.mb_130}>
               <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
            </View>
         );
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

   const renderArchive = React.useMemo(() => {
      return searchText ? null : <ArchivedChat />;
   }, [searchText]);

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

   return (
      <View style={styles.container}>
         <SectionList
            sections={DATA}
            ListHeaderComponent={renderArchive}
            keyExtractor={item => item.userJid}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            onEndReached={handleLoadMore}
            ListFooterComponent={renderFooterLoaderIfFetching}
            scrollEventThrottle={1}
            windowSize={20}
            onEndReachedThreshold={0.1}
            disableVirtualization={true}
            maxToRenderPerBatch={20}
         />
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
