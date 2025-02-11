import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import IconButton from '../common/IconButton';
import { BackArrowIcon } from '../common/Icons';
import Text from '../common/Text';
import PostView from '../components/PostView';
import { useMergedMediaMessages } from '../hooks/useMediaMessaegs';
import { getStringSet } from '../localization/stringSet';
import { useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';
import { getCurrentUserJid } from '../uikitMethods';

const PostPreViewPage = () => {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const { params: { jid = '', msgId = '' } = {} } = useRoute();
   const navigation = useNavigation();
   const currentUserJID = getCurrentUserJid();
   const { mergedMediaMessages: messageList } = useMergedMediaMessages(jid, ['image', 'video', 'audio']);
   const [title, setTitle] = React.useState('');
   const [currentIndex, setCurrentIndex] = React.useState(0);

   React.useEffect(() => {
      const isSender = currentUserJID === messageList[currentIndex]?.publisherJid;
      setTitle(
         isSender
            ? stringSet.MEDIA_PREVIEW_SCREEN.SENT_MEDIA_HEADER
            : stringSet.MEDIA_PREVIEW_SCREEN.RECEIVED_MEDIA_HEADER,
      );
   }, [currentIndex]);

   const handleBackBtn = () => {
      navigation.goBack();
   };

   const handlePageSelected = event => {
      setCurrentIndex(event.nativeEvent.position);
   };

   const initialPage = React.useMemo(() => {
      const selectedMsgIndex = messageList.findIndex(message => {
         return message.msgId === msgId;
      });
      setCurrentIndex(selectedMsgIndex);
      return selectedMsgIndex === -1 ? messageList.length - 1 : selectedMsgIndex;
   }, [messageList.length]);

   const renderMediaPages = React.useMemo(() => {
      return (
         <PagerView style={commonStyles.flex1} initialPage={initialPage} onPageScroll={handlePageSelected}>
            {messageList.map?.(item => (
               <PostView key={item.msgId} item={item} />
            ))}
         </PagerView>
      );
   }, [messageList]);

   return (
      <View style={commonStyles.flex1}>
         <View style={[styles.header, commonStyles.bg_color(themeColorPalatte.appBarColor)]}>
            <IconButton onPress={handleBackBtn}>
               <BackArrowIcon color={themeColorPalatte.iconColor} />
            </IconButton>
            <Text style={[styles.titleText, commonStyles.textColor(themeColorPalatte.headerPrimaryTextColor)]}>
               {title}
            </Text>
         </View>
         {renderMediaPages}
      </View>
   );
};

const styles = StyleSheet.create({
   header: { flexDirection: 'row', alignItems: 'center', height: 65 },
   titleText: {
      fontSize: 20,
      fontWeight: '500',
      marginLeft: 20,
   },
});

export default PostPreViewPage;
