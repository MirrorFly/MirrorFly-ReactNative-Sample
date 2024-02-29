import PropTypes from 'prop-types';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { getUserIdFromJid } from '../Helper/Chat/Utility';
import no_messages from '../assets/no_messages.png';
import Avathar from '../common/Avathar';
import { CollapseIcon, ExpandIcon } from '../common/Icons';
import Pressable from '../common/Pressable';
import { changeTimeFormat, timeFormat } from '../common/TimeStamp';
import commonStyles from '../common/commonStyles';
import { getImageSource } from '../common/utils';
import ApplicationColors from '../config/appColors';
import useRosterData from '../hooks/useRosterData';

const propTypes = {
   dbValue: PropTypes.array,
};

const Tile = ({ item, renderKey }) => {
   const { nickName, image: imageToken, colorCode } = useRosterData(getUserIdFromJid(item?.jid));
   return (
      <>
         <Pressable contentContainerStyle={[commonStyles.hstack, commonStyles.p_15]}>
            <Avathar data={nickName} profileImage={imageToken} backgroundColor={colorCode} />
            <View style={commonStyles.px_8}>
               <Text style={styles.nickNameText}>{nickName}</Text>
               <Text style={styles.stautsText}>{timeFormat(changeTimeFormat(item[renderKey]))}</Text>
            </View>
         </Pressable>
         <View style={commonStyles.dividerLine} />
      </>
   );
};

function GroupChatMessageInfo({ dbValue, chatUser }) {
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
      return <Tile item={item} renderKey={'receivedTime'} />;
   };

   const messageSeenInfo = ({ item }) => {
      return <Tile item={item} renderKey={'seenTime'} />;
   };

   return (
      <View style={[commonStyles.bg_white, commonStyles.paddingHorizontal_16]}>
         <Pressable onPress={toggleDeliveredSection} contentContainerStyle={[commonStyles.hstack, commonStyles.p_20]}>
            {expandDeliveredSection ? <CollapseIcon width="28" height="28" /> : <ExpandIcon width="28" height="28" />}
            <Text style={styles.title}>
               Delivered to {delivered.length} of {dbValue.length}
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
                  <View style={styles.emptyChatView}>
                     <Image style={styles.image} resizeMode="cover" source={getImageSource(no_messages)} />
                     <Text>Message sent, not delivered yet</Text>
                  </View>
               )}
            </>
         )}
         <View style={[commonStyles.dividerLine, commonStyles.marginTop_15]} />
         <Pressable onPress={toggleSeenSection} contentContainerStyle={[commonStyles.hstack, commonStyles.p_20]}>
            {expandSeenSection ? <CollapseIcon width="28" height="28" /> : <ExpandIcon width="28" height="28" />}
            <Text style={styles.title}>
               Read by {read.length} of {dbValue.length}
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
                  <View style={styles.emptyChatView}>
                     <Image style={styles.image} resizeMode="cover" source={getImageSource(no_messages)} />
                     <Text>Your message is not read</Text>
                  </View>
               )}
            </>
         )}
         <View style={[commonStyles.dividerLine, commonStyles.marginTop_15]} />
      </View>
   );
}

const styles = StyleSheet.create({
   title: {
      color: '#000',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 20,
   },
   nickNameText: {
      flexWrap: 'wrap',
      color: '#1f2937',
      fontWeight: 'bold',
      marginVertical: 2,
   },
   stautsText: {
      color: '#4b5563',
      marginVertical: 2,
   },
   image: {
      width: 200,
      height: 200,
   },
   emptyChatView: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ApplicationColors.white,
   },
});

GroupChatMessageInfo.propTypes = propTypes;

export default GroupChatMessageInfo;
