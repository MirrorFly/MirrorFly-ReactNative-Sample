import PropTypes from 'prop-types';
import React from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import no_messages from '../assets/no_messages.png';
import Avathar from '../common/Avathar';
import { CollapseIcon, ExpandIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import Text from '../common/Text';
import { changeTimeFormat, timeFormat } from '../common/timeStamp';
import { getImageSource, getUserIdFromJid } from '../helpers/chatHelpers';
import { getStringSet, replacePlaceholders } from '../localization/stringSet';
import { useRoasterData, useThemeColorPalatte } from '../redux/reduxHook';
import commonStyles from '../styles/commonStyles';

const propTypes = {
   dbValue: PropTypes.array,
};

const Tile = ({ item, renderKey, themeColorPalatte }) => {
   const { nickName, image: imageToken, colorCode } = useRoasterData(getUserIdFromJid(item?.jid));
   return (
      <>
         <Pressable contentContainerStyle={[commonStyles.hstack, commonStyles.p_15]}>
            <Avathar data={nickName} profileImage={imageToken} backgroundColor={colorCode} />
            <View style={commonStyles.px_8}>
               <Text style={[styles.nickNameText, { color: themeColorPalatte.primaryTextColor }]}>{nickName}</Text>
               <Text style={[styles.stautsText, { color: themeColorPalatte.secondaryTextColor }]}>
                  {timeFormat(changeTimeFormat(item[renderKey]))}
               </Text>
            </View>
         </Pressable>
         <View style={commonStyles.dividerLine(themeColorPalatte.dividerBg)} />
      </>
   );
};

Tile.propTypes = {
   item: PropTypes.object,
   renderKey: PropTypes.string,
   themeColorPalatte: PropTypes.object,
};

function GroupChatMessageInfo({ dbValue }) {
   const stringSet = getStringSet();
   const themeColorPalatte = useThemeColorPalatte();
   const delivered = dbValue.filter(val => val.receivedTime);
   const read = dbValue.filter(val => val.seenTime);
   const [expandDeliveredSection, setExpandDeliveredSection] = React.useState(false);
   const [expandSeenSection, setExpandSeenSection] = React.useState(false);

   const toggleDeliveredSection = () => {
      setExpandDeliveredSection(!expandDeliveredSection);
   };

   const toggleSeenSection = () => {
      setExpandSeenSection(!expandSeenSection);
   };

   const messageDeliverInfo = ({ item }) => {
      return <Tile item={item} renderKey={'receivedTime'} themeColorPalatte={themeColorPalatte} />;
   };

   const messageSeenInfo = ({ item }) => {
      return <Tile item={item} renderKey={'seenTime'} themeColorPalatte={themeColorPalatte} />;
   };

   return (
      <View style={[commonStyles.bg_color(themeColorPalatte.screenBgColor), commonStyles.paddingHorizontal_16]}>
         <Pressable onPress={toggleDeliveredSection} contentContainerStyle={[commonStyles.hstack, commonStyles.p_20]}>
            {expandDeliveredSection ? <CollapseIcon width="28" height="28" /> : <ExpandIcon width="28" height="28" />}
            <Text style={[styles.title, { color: themeColorPalatte.primaryTextColor }]}>
               {replacePlaceholders(stringSet.MESSAGE_INFO_SCREEN.DELIVERED_TO_LABEL, {
                  deliveredlength: delivered.length.toString(),
                  participantslength: dbValue.length,
               })}
            </Text>
         </Pressable>
         {expandDeliveredSection && (
            <>
               {delivered.length > 0 ? (
                  <FlatList
                     data={delivered}
                     renderItem={messageDeliverInfo}
                     keyExtractor={item => item._id}
                     initialNumToRender={20}
                     maxToRenderPerBatch={20}
                     scrollEventThrottle={1000}
                     windowSize={15}
                  />
               ) : (
                  <View style={[styles.emptyChatView, { backgroundColor: themeColorPalatte.screenBgColor }]}>
                     <Image style={styles.image} resizeMode="cover" source={getImageSource(no_messages)} />
                     <Text style={{ color: themeColorPalatte.primaryTextColor }}>
                        {stringSet.MESSAGE_INFO_SCREEN.NOT_DELIVERED}
                     </Text>
                  </View>
               )}
            </>
         )}
         <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg), commonStyles.marginTop_15]} />
         <Pressable onPress={toggleSeenSection} contentContainerStyle={[commonStyles.hstack, commonStyles.p_20]}>
            {expandSeenSection ? <CollapseIcon width="28" height="28" /> : <ExpandIcon width="28" height="28" />}
            <Text style={[styles.title, { color: themeColorPalatte.primaryTextColor }]}>
               {replacePlaceholders(stringSet.MESSAGE_INFO_SCREEN.READ_BY_LABEL, {
                  readlength: read.length.toString(),
                  participantslength: dbValue.length,
               })}
            </Text>
         </Pressable>
         {expandSeenSection && (
            <>
               {read.length > 0 ? (
                  <FlatList
                     data={read}
                     renderItem={messageSeenInfo}
                     keyExtractor={item => item._id}
                     initialNumToRender={20}
                     maxToRenderPerBatch={20}
                     scrollEventThrottle={1000}
                     windowSize={15}
                  />
               ) : (
                  <View style={[styles.emptyChatView, { backgroundColor: themeColorPalatte.screenBgColor }]}>
                     <Image style={styles.image} resizeMode="cover" source={no_messages} />
                     <Text style={{ color: themeColorPalatte.primaryTextColor }}>
                        {stringSet.MESSAGE_INFO_SCREEN.NOT_READ}
                     </Text>
                  </View>
               )}
            </>
         )}
         <View style={[commonStyles.dividerLine(themeColorPalatte.dividerBg), commonStyles.marginTop_15]} />
      </View>
   );
}

const styles = StyleSheet.create({
   title: {
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 20,
   },
   nickNameText: {
      flexWrap: 'wrap',
      fontWeight: 'bold',
      marginVertical: 2,
   },
   stautsText: {
      marginVertical: 2,
   },
   image: {
      width: 200,
      height: 200,
   },
   emptyChatView: {
      justifyContent: 'center',
      alignItems: 'center',
   },
});

GroupChatMessageInfo.propTypes = propTypes;

export default GroupChatMessageInfo;
