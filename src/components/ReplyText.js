import { Pressable, ScrollView } from 'react-native';
import React from 'react';
import { HStack, Text, View } from 'native-base';
import { ClearTextIcon } from '../common/Icons';
import { useSelector } from 'react-redux';
import useRosterData from '../hooks/useRosterData';
import { getUserIdFromJid } from '../Helper/Chat/Utility';

const ReplyText = props => {
   const { replyMsgItems, handleRemove, selectedMsgIndex } = props;
   const scrollViewRef = React.useRef(null);
   const { publisherJid = '', fromUserId = '' } = replyMsgItems;
   const profileDetails = useSelector(state => state.navigation.profileDetails);
   const currentUserJID = useSelector(state => state.auth.currentUserJID);
   const isSameUser = publisherJid === currentUserJID;
   const averageMessageHeight = 60;
   const publisherId = getUserIdFromJid(publisherJid);

   let { nickName } = useRosterData(isSameUser ? '' : publisherId);
   // updating default values
   nickName = nickName || profileDetails?.nickName || publisherId || '';

   React.useEffect(() => {
      if (scrollViewRef.current && selectedMsgIndex !== undefined) {
         const scrollToPosition = selectedMsgIndex * averageMessageHeight;
         scrollViewRef.current.scrollTo({ y: scrollToPosition, animated: true });
      }
   }, [selectedMsgIndex]);

   const RemoveHandle = () => {
      handleRemove();
   };

   return (
      <ScrollView keyboardShouldPersistTaps={'always'} ref={scrollViewRef}>
         <View>
            <HStack justifyContent={'space-between'} alignItems={'center'}>
               {isSameUser ? (
                  <Text color={'#000'} fontSize={14} pl={1} mb={1} fontWeight={600} py="0">
                     You
                  </Text>
               ) : (
                  <Text mb={2} color={'#000'} pl={0} fontSize={14} fontWeight={600} py="0">
                     {nickName || fromUserId}
                  </Text>
               )}
               <Pressable
                  style={{
                     padding: 5,
                     top: -3,
                     right: 10,
                     bottom: 0,
                     backgroundColor: '#FFF',
                     borderRadius: 10,
                     borderColor: '#000',
                     borderWidth: 1,
                  }}
                  onPress={RemoveHandle}>
                  <ClearTextIcon />
               </Pressable>
            </HStack>
            <Text numberOfLines={1} pl={2} fontSize={14} color="#313131">
               {replyMsgItems?.msgBody?.message}
            </Text>
         </View>
      </ScrollView>
   );
};

export default ReplyText;
