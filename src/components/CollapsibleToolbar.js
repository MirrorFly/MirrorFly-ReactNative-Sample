import { useNavigation } from '@react-navigation/native';
import { AlertDialog, Center, HStack, Icon, IconButton, Pressable, Switch, Text, View } from 'native-base';
import PropTypes from 'prop-types';
import React from 'react';
import { Animated, Dimensions, Image, PixelRatio, StyleSheet } from 'react-native';
import { getUsernameGraphemes } from '../Helper/index';
import {
   CallIcon,
   FrontArrowIcon,
   GalleryAllIcon,
   LeftArrowIcon,
   MailIcon,
   ReportIcon,
   StatusIcon,
} from '../common/Icons';
import { VIEWALLMEDIA } from '../constant';
import useFetchImage from '../hooks/useFetchImage';
const propTypes = {
   chatUser: PropTypes.string,
   src: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
   title: PropTypes.string,
   titleStatus: PropTypes.string,
   titleColor: PropTypes.string,
   leftItem: PropTypes.element,
   leftItemPress: PropTypes.func,
   rightItem: PropTypes.element,
   rightItemPress: PropTypes.func,
   toolbarColor: PropTypes.string,
   toolbarMaxHeight: PropTypes.number,
   toolbarMinHeight: PropTypes.number,
};

const defaultProps = {
   chatUser: '',
   leftItem: null,
   leftItemPress: null,
   rightItem: null,
   rightItemPress: null,
   title: 'Ashik',
   titleStatus: 'Online',
   titleColor: '#000',
   toolbarColor: 'red',
   toolbarMaxHeight: 400,
   toolbarMinHeight: 60,
   mobileNo: '',
   email: '',
   bgColor: '#3276E2',
};

const CollapsingToolbar = ({
   chatUser,
   bgColor,
   title,
   imageToken,
   titleStatus,
   toolbarMaxHeight,
   toolbarMinHeight,
   mobileNo,
   email,
   handleBackBtn,
}) => {
   const navigation = useNavigation();
   const [visible, setVisible] = React.useState(false);
   const scrollY = React.useRef(new Animated.Value(0)).current;
   const [animatedTitleColor, setAnimatedTitleColor] = React.useState(250);
   const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
   const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
   const pixelRatio = PixelRatio.get();
   const baseFontSize = 45;
   const adaptiveMinHeight = screenHeight * 0.92;
   const scaledFontSize = ((baseFontSize * screenWidth) / 375) * pixelRatio;

   const { imageUrl, authToken } = useFetchImage(imageToken);

   const headerTranslate = scrollY.interpolate({
      inputRange: [0, scrollDistance],
      outputRange: [0, -scrollDistance],
      extrapolate: 'clamp',
   });

   const imageOpacity = scrollY.interpolate({
      inputRange: [0, scrollDistance / 2, scrollDistance],
      outputRange: [1, 1, 0],
      extrapolate: 'clamp',
   });

   const titleScale = scrollY.interpolate({
      inputRange: [0, scrollDistance / 2, scrollDistance],
      outputRange: [1, 1, 0.8],
      extrapolate: 'clamp',
   });

   const handleModel = () => {
      setVisible(true);
   };

   const handleTapDetails = () => {
      navigation.navigate(VIEWALLMEDIA, { chatUser, title });
   };
   const HandleClose = () => {
      setVisible(false);
   };

   const onClose = () => {
      setVisible(false);
   };

   return (
      <View style={styles.fill}>
         <Animated.View
            style={[
               styles.header,
               {
                  backgroundColor: '#f2f2f2',
                  height: toolbarMaxHeight,
                  transform: [{ translateY: headerTranslate }],
                  elevation: 5,
                  shadowColor: '#181818',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.1,
               },
            ]}>
            <Animated.View
               style={[
                  styles.header,
                  {
                     justifyContent: 'center',
                     alignItems: 'center',
                     backgroundColor: bgColor,
                     height: toolbarMaxHeight,
                     opacity: imageOpacity,
                  },
               ]}>
               {imageUrl ? (
                  <Image
                     style={styles.profileImage}
                     source={{
                        uri: imageUrl,
                        method: 'GET',
                        cache: 'force-cache',
                        headers: {
                           Authorization: authToken,
                        },
                     }}
                  />
               ) : (
                  <Text color="#fff" fontWeight={500} fontSize={scaledFontSize}>
                     {getUsernameGraphemes(title)}
                  </Text>
               )}
            </Animated.View>
            <Animated.View
               style={[
                  styles.action,
                  {
                     backgroundColor: 'transparent',
                     transform: [{ scale: titleScale }],
                  },
               ]}>
               <View>
                  <Animated.Text
                     style={[
                        styles.title,
                        {
                           color: animatedTitleColor < 280 ? '#fff' : '#000',
                        },
                     ]}>
                     {title}
                  </Animated.Text>
                  {animatedTitleColor < 280 && (
                     <Text pl="1" style={[styles.titleStatus, { color: '#fff' }]}>
                        {titleStatus}
                     </Text>
                  )}
               </View>
            </Animated.View>
         </Animated.View>
         <Animated.View style={styles.bar}>
            <View style={styles.left}>
               <IconButton
                  onPress={handleBackBtn}
                  _pressed={{
                     bg: animatedTitleColor < 280 ? 'rgba(0,0,0, 0.2)' : 'rgba(50,118,226, 0.1)',
                  }}
                  icon={
                     <Icon as={() => LeftArrowIcon(animatedTitleColor < 280 ? '#fff' : '#000')} name="emoji-happy" />
                  }
                  borderRadius="full"
               />
            </View>
         </Animated.View>
         <Animated.ScrollView
            bounces={false}
            style={styles.fill}
            scrollEventThrottle={1}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
               useNativeDriver: true,
               listener: event => {
                  const { y } = event.nativeEvent.contentOffset;
                  setAnimatedTitleColor(y);
               },
            })}>
            <View mx="3" mt={toolbarMaxHeight} minHeight={adaptiveMinHeight}>
               <HStack my="7" justifyContent={'space-between'}>
                  <Text fontSize={14} fontWeight={500} color={'#181818'}>
                     {' '}
                     Mute Notification{' '}
                  </Text>
                  <Switch
                     size="md"
                     offTrackColor="indigo.100"
                     onTrackColor="indigo.200"
                     onThumbColor="blue.500"
                     offThumbColor="indigo.50"
                  />
               </HStack>
               <View mb={4} borderBottomWidth={1} borderBottomColor={'#f2f2f2'}>
                  <Text mb={2} fontSize={14} color={'#181818'} fontWeight={500}>
                     Email
                  </Text>
                  <HStack>
                     <MailIcon />
                     <Text mb={2} ml={2} color="#959595" fontSize={13}>
                        {email}
                     </Text>
                  </HStack>
               </View>
               <View mb={4} borderBottomWidth={1} borderBottomColor={'#f2f2f2'}>
                  <Text mb={2} fontSize={14} color={'#181818'} fontWeight={500}>
                     Mobile Number
                  </Text>
                  <HStack>
                     <CallIcon />
                     <Text mb={2} ml={2} color="#959595" fontSize={13}>
                        {mobileNo}
                     </Text>
                  </HStack>
               </View>
               <View mb={4} borderBottomWidth={1} borderBottomColor={'#f2f2f2'}>
                  <Text mb={2} fontSize={14} color={'#000'} fontWeight={500}>
                     Status
                  </Text>
                  <HStack>
                     <StatusIcon />
                     <Text mb={2} ml={2} color="#959595" fontSize={13}>
                        {titleStatus}
                     </Text>
                  </HStack>
               </View>
               <Pressable onPress={handleTapDetails} borderBottomColor={'#f2f2f2'} borderBottomWidth={1}>
                  <HStack my="3" alignItems={'center'} justifyContent={'space-between'}>
                     <HStack alignItems={'center'}>
                        <GalleryAllIcon />
                        <Text ml="3" fontSize={14} color={'#181818'} fontWeight={500}>
                           View All Media
                        </Text>
                     </HStack>
                     <FrontArrowIcon />
                  </HStack>
               </Pressable>
               <Pressable onPress={handleModel}>
                  <HStack my="3" alignItems={'center'} justifyContent={'space-between'}>
                     <HStack alignItems={'center'}>
                        <ReportIcon />
                        <Text ml="5" fontSize={14} color="#FF0000" fontWeight={500}>
                           Report
                        </Text>
                     </HStack>
                  </HStack>
               </Pressable>
            </View>
         </Animated.ScrollView>
         <Center maxH={'40'} width={'60'}>
            <AlertDialog isOpen={visible} onClose={onClose}>
               <AlertDialog.Content w="85%" borderRadius={0} px="3" py="3" fontWeight={'600'}>
                  <Text mb="2" fontSize={16} color={'black'} fontWeight={'500'}>
                     Report Mano Prod Dev?
                  </Text>
                  <Text fontSize={16} color={'black'}>
                     The last 5 messages from this contact will be forwarded to the admin. This contact will not be
                     notified.
                  </Text>
                  <HStack justifyContent={'flex-end'} paddingY={'2'}>
                     <Pressable onPress={HandleClose}>
                        <Text fontWeight={'500'} color={'#3276E2'}>
                           Cancel
                        </Text>
                     </Pressable>
                     <Pressable onPress={HandleClose}>
                        <Text fontWeight={'500'} ml="3" color={'#3276E2'}>
                           Report
                        </Text>
                     </Pressable>
                  </HStack>
               </AlertDialog.Content>
            </AlertDialog>
         </Center>
      </View>
   );
};

CollapsingToolbar.propTypes = propTypes;
CollapsingToolbar.defaultProps = defaultProps;

export default CollapsingToolbar;
const styles = StyleSheet.create({
   fill: {
      flex: 1,
   },
   content: {
      flex: 1,
   },
   header: {
      top: 0,
      left: 0,
      right: 0,
      overflow: 'hidden',
      position: 'absolute',
   },
   backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: null,
      resizeMode: 'cover',
   },
   action: {
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginVertical: 13,
      position: 'absolute',
   },
   bar: {
      zIndex: 10,
      top: 0,
      left: 0,
      right: 0,
      height: 70,
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
   },
   left: {
      top: 0,
      left: 0,
      width: 50,
      height: 70,
      alignItems: 'center',
      justifyContent: 'center',
   },
   right: {
      top: 0,
      right: 0,
      height: 56,
      minWidth: 56,
      alignItems: 'center',
      justifyContent: 'center',
   },
   title: {
      fontSize: 25,
      padding: 2,
      alignItems: 'center',
   },
   titleStatus: {
      fontSize: 14,
   },
   scrollViewContent: {
      paddingTop: 30,
   },
   row: {
      height: 40,
      margin: 16,
      backgroundColor: '#D3D3D3',
      alignItems: 'center',
      justifyContent: 'center',
   },
   profileImage: {
      width: '100%',
      height: '100%',
   },
});
