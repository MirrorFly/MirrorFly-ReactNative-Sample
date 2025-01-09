import React from 'react';
import { Dimensions, Image, View } from 'react-native';
import { useThemeColorPalatte } from '../redux/reduxHook';
/** import ImageViewer from 'react-native-image-zoom-viewer'; */

const ImageInfo = props => {
   const { selectedMedia } = props;
   const themeColorPalatte = useThemeColorPalatte();
   const SingleSelectedImage = selectedMedia.media;
   /**
    let isSender = currentUserJID === props?.message?.fromUserJid
        const [arrayList, setArrayList] = React.useState("");
     *  const messageArray = Object.values(messages[userJid].messages);
        const filterMessagesByType = (messageType) => {
        return messageArray.filter((message) => message.msgBody?.message_type === messageType);
        };

     React.useEffect(() => {
        const filteredMsgInfo = filterMessagesByType();
        setArrayList(filteredMsgInfo);
    }, [])
    */

   const ImageBase64 = SingleSelectedImage.local_path || SingleSelectedImage?.file?.fileDetails?.uri;
   /**const [initialImageSize, setInitialImageSize] = React.useState({
      width: 100,
      height: 100,
   });*/

   const calculateInitialImageSize = () => {
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;

      const imageAspectRatio = SingleSelectedImage.androidWidth / SingleSelectedImage.androidHeight;
      /**let initialWidth = windowWidth;*/
      let initialHeight = windowWidth / imageAspectRatio;

      if (initialHeight > windowHeight) {
         /**
            initialHeight = windowHeight;
          * initialWidth = windowHeight * imageAspectRatio;
          * */
      }

      /**setInitialImageSize({ width: initialWidth, height: initialHeight });*/
   };
   React.useEffect(() => {
      calculateInitialImageSize();
   }, []);

   /**
   const images = [
      {
         url: ImageBase64,
      },
   ];

    const handleBackBtn = () => {
    props.handleBackBtn();
  }; 

  const initialIndex = 0;
  */
   return (
      <View style={{ flex: 1 }}>
         <View style={{ flex: 1, backgroundColor: themeColorPalatte.screenBgColor }}>
            <Image
               style={{ flex: 1, width: '100%', height: '100%' }}
               source={{ uri: ImageBase64 }}
               resizeMode="contain"
            />

            {/* <ImageZoom
               uri={ImageBase64}
               minScale={0.5}
               maxScale={3}
               onInteractionStart={() => mflog('Interaction started')}
               onInteractionEnd={() => mflog('Interaction ended')}
               onPinchStart={() => mflog('Pinch gesture started')}
               onPinchEnd={() => mflog('Pinch gesture ended')}
               onPanStart={() => mflog('Pan gesture started')}
               onPanEnd={() => mflog('Pan gesture ended')}
               onResetAnimationEnd={() => mflog('Reset animation ended')}
               // resizeMode="cover"
            /> */}
            {/* <ImageViewer
               imageUrls={images}
               style={initialImageSize}
               renderIndicator={() => null}
               backgroundColor="#fff"
               index={initialIndex}
               enableImageZoom={false}
               useNativeDriver={true}
               maxOverflow={3}
               // enableSwipeDown={true}
            /> */}
         </View>
      </View>
   );
};

export default ImageInfo;
