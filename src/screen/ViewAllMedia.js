import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, BackHandler, Dimensions, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { TabBar, TabView } from 'react-native-tab-view';
import { useSelector } from 'react-redux';
import { convertBytesToKB } from '../Helper';
import { handleFileOpen } from '../Helper/Chat/ChatHelper';
import { getThumbBase64URL, getUserIdFromJid } from '../Helper/Chat/Utility';
import IconButton from '../common/IconButton';
import {
   AudioWhileIcon,
   CSVIcon,
   DocIcon,
   LeftArrowIcon,
   PPTIcon,
   PdfIcon,
   PlayIcon,
   TXTIcon,
   XLSIcon,
   ZipIcon,
} from '../common/Icons';
import Pressable from '../common/Pressable';
import { docTimeFormat } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import { getExtension } from '../components/chat/common/fileUploadValidation';
import ApplicationColors from '../config/appColors';
import { MEDIA_POST_PRE_VIEW_SCREEN } from '../constant';
import useRosterData from '../hooks/useRosterData';

const LeftArrowComponent = () => LeftArrowIcon();
const AudioWhileIconComponent = () => AudioWhileIcon();

const ViewAllMedia = () => {
   const navigation = useNavigation();
   const {
      params: { jid = '', title = '' },
   } = useRoute();
   const chatUserId = getUserIdFromJid(jid);
   const { data: messages } = useSelector(state => state.chatConversationData);
   const [index, setIndex] = React.useState(0);
   const [loading, setLoading] = React.useState(false);
   const [countBasedOnType, setCountBasedOnType] = React.useState({});
   const [mediaMessages, setMediaMessages] = React.useState([]);
   const [docsMessages, setDocsMessages] = React.useState([]);

   const { nickName = title } = useRosterData(getUserIdFromJid(jid));
   let numColumns = 4;
   const { width } = Dimensions.get('window');
   const tileSize = width / numColumns;

   React.useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackBtn);
      return () => {
         backHandler.remove();
      };
   }, []);

   React.useEffect(() => {
      toggleLoading();
      handleGetMedia();
   }, [messages]);

   const toggleLoading = () => {
      setLoading(val => !val);
   };

   const messageList = React.useMemo(() => {
      const data = messages[chatUserId]?.messages ? Object.values(messages[chatUserId]?.messages) : [];
      const filteredMessages = data.filter(message => {
         const { deleteStatus, recallStatus } = message;
         const { media, message_type } = message.msgBody;
         return (
            ['image', 'video', 'audio'].includes(message_type) &&
            media &&
            media.is_downloaded === 2 &&
            media.is_uploading === 2 &&
            deleteStatus === 0 &&
            recallStatus === 0
         );
      });
      return filteredMessages;
   }, [messages, jid]);

   // Function to fetch count based on message_type
   const getMessageTypeCount = (messages, messageType) => {
      return messages.filter(message => message.msgBody.message_type === messageType).length;
   };

   const handleGetMedia = async () => {
      const imageCount = messageList?.reverse()?.filter(res => ['image'].includes(res.msgBody.message_type));
      setCountBasedOnType({
         ...countBasedOnType,
         imageCount: imageCount.length,
      });
      const filtedMediaMessages = messageList.filter(res =>
         ['image', 'video', 'audio'].includes(res?.msgBody?.message_type),
      );
      const filtedDocsMessages = messageList.filter(res => ['file'].includes(res?.msgBody?.message_type));
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
      return true;
   };

   const renderImageCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'image') > 1
         ? getMessageTypeCount(mediaMessages, 'image') + ' Photos'
         : getMessageTypeCount(mediaMessages, 'image') + ' Photo';
   };

   const renderVideoCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'video') > 1
         ? getMessageTypeCount(mediaMessages, 'video') + ' Videos'
         : getMessageTypeCount(mediaMessages, 'video') + ' Video';
   };

   const renderAudioCountLabel = () => {
      return getMessageTypeCount(mediaMessages, 'audio') > 1
         ? getMessageTypeCount(mediaMessages, 'audio') + ' Audios'
         : getMessageTypeCount(mediaMessages, 'audio') + ' Audio';
   };

   const renderDocCountLabel = () => {
      return getMessageTypeCount(docsMessages, 'file') > 1
         ? getMessageTypeCount(docsMessages, 'file') + ' Documents'
         : getMessageTypeCount(docsMessages, 'file') + ' Document';
   };

   const renderMediaFooter = () => {
      return (
         <>
            {mediaMessages.length > 0 && (
               <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>
                  {renderImageCountLabel()}, {renderVideoCountLabel()}, {renderAudioCountLabel()}
               </Text>
            )}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const renderDocFooter = () => {
      return (
         <>
            {docsMessages.length > 0 && (
               <Text style={[commonStyles.textCenter, commonStyles.colorBlack]}>{renderDocCountLabel()}</Text>
            )}
            {loading && (
               <View style={[commonStyles.mb_130, commonStyles.marginTop_5]}>
                  <ActivityIndicator size="large" color={ApplicationColors.mainColor} />
               </View>
            )}
         </>
      );
   };

   const renderTileBasedOnMessageType = item => {
      const { msgBody: { media: { thumb_image = '', local_path = '' } = {}, message_type = '' } = {} } = item;
      const thumbURL = local_path || getThumbBase64URL(thumb_image);
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
               <Image
                  source={{ uri: message_type === 'video' ? getThumbBase64URL(thumb_image) : thumbURL }}
                  style={styles.imageView}
               />

               {message_type === 'video' && (
                  <View style={styles.playIconWrapper}>
                     <PlayIcon width={10} height={10} />
                  </View>
               )}
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
         navigation.navigate(MEDIA_POST_PRE_VIEW_SCREEN, { jid, msgId: item.msgId });
      };
      return <Pressable onPress={handleMediaPress}>{renderTileBasedOnMessageType(item)}</Pressable>;
   };

   const renderFileIcon = fileExtension => {
      switch (fileExtension) {
         case 'pdf':
            return <PdfIcon />;
         case 'ppt':
         case 'pptx':
            return <PPTIcon />;
         case 'csv':
            return <CSVIcon />;
         case 'xls':
         case 'xlsx':
            return <XLSIcon />;
         case 'doc':
         case 'docx':
            return <DocIcon />;
         case 'zip':
         case 'rar':
            return <ZipIcon width={30} height={25} />;
         case 'txt':
         case 'text':
            return <TXTIcon />;
         default:
            return null;
      }
   };

   const renderDocTile = ({ item }) => {
      const { createdAt, msgBody: { media: { fileName, file_size } } = {} } = item;
      const fileExtension = getExtension(fileName, false);
      const onPress = () => {
         handleFileOpen(item);
      };
      return (
         <>
            <Pressable
               onPress={onPress}
               contentContainerStyle={[
                  commonStyles.hstack,
                  commonStyles.alignItemsCenter,
                  commonStyles.paddingHorizontal_8,
                  commonStyles.paddingVertical_18,
               ]}>
               <View style={[commonStyles.paddingVertical_8]}>{renderFileIcon(fileExtension)}</View>
               <View style={[commonStyles.flex1, commonStyles.p_4, commonStyles.px_18]}>
                  <Text style={styles.fileNameText}>{fileName}</Text>
                  <Text style={styles.fileSizeText}>{convertBytesToKB(file_size)}</Text>
               </View>
               <View style={[commonStyles.justifyContentFlexEnd]}>
                  <Text style={styles.fileSizeText}>{docTimeFormat(createdAt)}</Text>
               </View>
            </Pressable>
            <View style={[commonStyles.dividerLine]} />
         </>
      );
   };

   const renderScene = ({ route }) => {
      switch (route.key) {
         case '1':
            return (
               <View>
                  {!loading && mediaMessages.length === 0 ? (
                     <View
                        style={[
                           commonStyles.justifyContentCenter,
                           commonStyles.alignItemsCenter,
                           commonStyles.height_100_per,
                        ]}>
                        <Text>No Media Found ...!!!</Text>
                     </View>
                  ) : (
                     <View style={commonStyles.marginTop_5}>
                        <FlatList
                           numColumns={4}
                           keyExtractor={item => item.msgId}
                           data={mediaMessages}
                           bounces={false}
                           ListFooterComponent={renderMediaFooter}
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
                        style={[
                           commonStyles.justifyContentCenter,
                           commonStyles.alignItemsCenter,
                           commonStyles.height_100_per,
                        ]}>
                        <Text>No Docs Found...!!!</Text>
                     </View>
                  ) : (
                     <View style={[commonStyles.marginTop_5, commonStyles.padding_8]}>
                        <FlatList
                           showsVerticalScrollIndicator={false}
                           data={docsMessages}
                           keyExtractor={item => item.msgId}
                           bounces={false}
                           renderItem={renderDocTile}
                           ListFooterComponent={renderDocFooter}
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
      <TabBar
         {...props}
         style={styles.tabbar}
         indicatorStyle={styles.tabbarIndicator}
         labelStyle={styles.tabarLabel}
         renderLabel={renderLabel}
         activeColor={ApplicationColors.mainColor}
         inactiveColor={ApplicationColors.black}
         pressColor="transparent"
         pressOpacity={0}
      />
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
               <Text ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>
                  {nickName}
               </Text>
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
      marginHorizontal: 2,
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
   fileNameText: {
      fontSize: 13,
      color: '#000',
   },
   fileSizeText: {
      fontSize: 11,
      color: '#000',
   },
   playIconWrapper: {
      backgroundColor: ApplicationColors.mainbg,
      position: 'absolute',
      top: '50%',
      left: '50%',
      // transforming X and Y for actual width of the icon plus the padding divided by 2 to make it perfectly centered ( 15(width) + 12(padding) / 2 = 13.5 )
      transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
      elevation: 5,
      shadowColor: ApplicationColors.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      padding: 6,
      borderRadius: 50,
   },
});
