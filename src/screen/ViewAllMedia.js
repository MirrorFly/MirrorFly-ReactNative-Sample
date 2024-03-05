import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { getThumbBase64URL, getUserIdFromJid } from '../Helper/Chat/Utility';
import SDK from '../SDK/SDK';
import IconButton from '../common/IconButton';
import { AudioWhileIcon, LeftArrowIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import commonStyles from '../common/commonStyles';
import ApplicationColors from '../config/appColors';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../constant';
import useRosterData from '../hooks/useRosterData';

const LeftArrowComponent = () => LeftArrowIcon();
const AudioWhileIconComponent = () => AudioWhileIcon();

const ViewAllMedia = () => {
   const navigation = useNavigation();
   const {
      params: { chatUser = '', title = '' },
   } = useRoute();
   const [index, setIndex] = React.useState(0);
   const [loading, setLoading] = React.useState(false);
   const [countBasedOnType, setCountBasedOnType] = React.useState({});
   const [mediaMessages, setMediaMessages] = React.useState([]);
   const [docsMessages, setDocsMessages] = React.useState([]);

   const { nickName = title } = useRosterData(getUserIdFromJid(chatUser));
   let numColumns = 4;
   const { width } = Dimensions.get('window');
   const tileSize = width / numColumns;

   React.useEffect(() => {
      toggleLoading();
      setTimeout(() => {
         handleGetMedia();
      }, 1000);
   }, []);

   const toggleLoading = () => {
      setLoading(val => !val);
   };

   // Function to fetch count based on message_type
   const getMessageTypeCount = (messages, messageType) => {
      return messages.filter(message => message.msgBody.message_type === messageType).length;
   };

   const handleGetMedia = async () => {
      const mediaMessageList = await SDK.getMediaMessages(chatUser);
      const imageCount = mediaMessageList.filter(res => ['image'].includes(res.msgBody.message_type));
      setCountBasedOnType({
         ...countBasedOnType,
         imageCount: imageCount.length,
      });
      const filtedMediaMessages = mediaMessageList.filter(res =>
         ['image', 'video', 'audio'].includes(res?.msgBody?.message_type),
      );
      const filtedDocsMessages = mediaMessageList.filter(res => ['file'].includes(res?.msgBody?.message_type));
      setDocsMessages(filtedDocsMessages || []);
      setMediaMessages(filtedMediaMessages || []);
      toggleLoading();
   };

   const [routes] = React.useState([
      { key: '1', title: 'Media' },
      { key: '2', title: 'Docs' },
      { key: '3', title: 'Links' },
   ]);
   const handleBackBtn = () => {
      navigation.goBack();
   };

   const renderFooter = () => {
      if (!loading && mediaMessages.length) {
         return (
            <Text style={commonStyles.textCenter}>
               {getMessageTypeCount(mediaMessages, 'image')} Photos, {getMessageTypeCount(mediaMessages, 'video')}{' '}
               Videos, {getMessageTypeCount(mediaMessages, 'audio')} Audios
            </Text>
         );
      }
      return (
         <>
            {mediaMessages.length > 0 && (
               <Text style={commonStyles.textCenter}>
                  {getMessageTypeCount(mediaMessages, 'image')} Photos, {getMessageTypeCount(mediaMessages, 'video')}{' '}
                  Videos, {getMessageTypeCount(mediaMessages, 'audio')} Audios
               </Text>
            )}
            <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
               <ActivityIndicator size="large" color={'#3276E2'} />
            </View>
         </>
      );
   };

   const renderTileBasedOnMessageType = item => {
      const { msgBody: { media: { thumb_image } = {}, message_type = '' } = {} } = item;
      const thumbURL = thumb_image ? getThumbBase64URL(thumb_image) : '';
      if (['image', 'video'].includes(message_type)) {
         return (
            <View
               style={[
                  {
                     width: tileSize,
                     height: tileSize,
                  },
                  styles.mediaTile,
               ]}>
               <Image source={{ uri: thumbURL }} style={styles.imageView} />
            </View>
         );
      }
      if (['audio'].includes(message_type)) {
         return (
            <View
               style={[
                  commonStyles.justifyContentCenter,
                  commonStyles.alignItemsCenter,
                  styles.aduioTile,
                  { width: tileSize - 4, height: tileSize - 4 },
               ]}>
               {<AudioWhileIconComponent />}
            </View>
         );
      }
   };

   const renderMediaTile = ({ item }) => {
      const handleMediaPress = () => {
         navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { chatUser, msgId: item.msgId });
      };
      return <Pressable onPress={handleMediaPress}>{renderTileBasedOnMessageType(item)}</Pressable>;
   };

   const renderScene = ({ route }) => {
      switch (route.key) {
         case '1':
            return (
               <View>
                  {!loading && mediaMessages.length === 0 ? (
                     <View
                        style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.flex1]}>
                        <Text>No Media Found ...!!!</Text>
                     </View>
                  ) : (
                     <View style={commonStyles.marginTop_5}>
                        <FlatList
                           numColumns={4}
                           data={mediaMessages}
                           bounces={false}
                           ListFooterComponent={renderFooter}
                           renderItem={renderMediaTile}
                           initialNumToRender={20}
                           maxToRenderPerBatch={20}
                           windowSize={15}
                        />
                     </View>
                  )}
               </View>
            );
         case '2':
            return (
               <View>
                  {!loading && docsMessages.length === 0 ? (
                     <View
                        style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.flex1]}>
                        <Text>No Docs Found...!!!</Text>
                     </View>
                  ) : (
                     <View style={commonStyles.marginTop_5}>
                        <FlatList
                           data={docsMessages}
                           bounces={false}
                           renderItem={renderMediaTile}
                           initialNumToRender={20}
                           maxToRenderPerBatch={20}
                           windowSize={15}
                        />
                     </View>
                  )}
               </View>
            );
         case '3':
            return (
               <View style={[commonStyles.justifyContentCenter, commonStyles.alignItemsCenter, commonStyles.flex1]}>
                  <Text> No Links Found...!!!</Text>
               </View>
            );
         default:
            return null;
      }
   };

   const renderLabel = React.useCallback(scene => {
      return (
         <View style={commonStyles.hstack}>
            <Text style={[styles.tabarLabel, { color: scene.color }]}>{scene.route.title.toUpperCase()}</Text>
         </View>
      );
   }, []);

   const renderTabBar = props => (
      <>
         <View>
            <TabBar
               {...props}
               style={styles.tabbar}
               indicatorStyle={styles.tabbarIndicator}
               labelStyle={styles.tabarLabel}
               renderLabel={renderLabel}
               activeColor={ApplicationColors.mainColor}
               inactiveColor={ApplicationColors.black}
            />
         </View>
      </>
   );
   return (
      <View style={styles.tabContainer}>
         <View style={[styles.container, commonStyles.hstack]}>
            <View
               style={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.flex1,
                  commonStyles.marginLeft_10,
               ]}>
               <IconButton onPress={handleBackBtn}>
                  <LeftArrowComponent />
               </IconButton>
               <Text style={styles.titleText}>{nickName}</Text>
            </View>
         </View>

         <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
         />
      </View>
   );
};
export default ViewAllMedia;
const styles = StyleSheet.create({
   parentContainer: {
      flex: 1,
      backgroundColor: '#fff',
   },
   container: {
      height: 60,
      backgroundColor: ApplicationColors.headerBg,
   },
   titleText: {
      fontSize: 18,
      paddingHorizontal: 12,
      fontWeight: '500',
      color: ApplicationColors.black,
   },
   tabContainer: {
      flex: 1,
      backgroundColor: '#fff',
   },
   tabbar: {
      backgroundColor: '#F2F2F2',
      color: 'black',
   },
   tabbarIndicator: {
      backgroundColor: '#3276E2',
      borderColor: '#3276E2',
      borderWidth: 1.3,
   },
   tabarLabel: {
      color: 'black',
      fontWeight: 'bold',
   },
   aduioTile: {
      marginTop: 2,
      backgroundColor: '#97A5C7',
      padding: 2,
   },
   mediaTile: {
      backgroundColor: '#f2f2f2',
      padding: 2,
   },
   imageView: { flex: 1, resizeMode: 'cover' },
   bottomCountContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      paddingVertical: 10,
   },
});
