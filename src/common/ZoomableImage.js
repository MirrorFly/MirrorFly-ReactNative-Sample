import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { getThumbBase64URL } from '../helpers/chatHelpers';
import { useThemeColorPalatte } from '../redux/reduxHook';
import PropTypes from 'prop-types';

export default function ZoomableImage({ image, thumbImage }) {
   const { width: screenWidth, height: screenHeight } = useWindowDimensions();
   const themeColorPalatte = useThemeColorPalatte();

   const [imageSize, setImageSize] = useState({ width: 1000, height: 1000 });

   useEffect(() => {
      if (image) {
         Image.getSize(image, (imgWidth, imgHeight) => {
            const aspectRatio = imgWidth / imgHeight;
            let newWidth = screenWidth;
            let newHeight = screenWidth / aspectRatio;

            if (newHeight > screenHeight) {
               newHeight = screenHeight;
               newWidth = screenHeight * aspectRatio;
            }

            setImageSize({ width: newWidth, height: newHeight });
         });
      }
   }, [image, screenWidth, screenHeight]);

   const translate = useSharedValue({ x: 0, y: 0 });
   const scale = useSharedValue(1);
   const scaleOffset = useSharedValue(1);
   const offset = useSharedValue({ x: 0, y: 0 });

   const pinch = Gesture.Pinch()
      .onStart(() => {
         offset.value = { ...translate.value };
         scaleOffset.value = scale.value;
      })
      .onUpdate(e => {
         scale.value = Math.max(1, e.scale * scaleOffset.value);
      })
      .onEnd(() => {
         if (scale.value < 1) {
            scale.value = withTiming(1);
            translate.value = withTiming({ x: 0, y: 0 });
         }
      });

   const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: translate.value.x }, { translateY: translate.value.y }],
   }));

   return (
      <View style={styles.root(themeColorPalatte.screenBgColor)}>
         <GestureDetector gesture={pinch}>
            <Animated.View style={[animatedStyle, styles.center]}>
               {/* Thumbnail (Always Visible Until Main Image Loads) */}
               <Image
                  style={[styles.image(imageSize.width, imageSize.height), { position: 'absolute' }]}
                  source={{ uri: getThumbBase64URL(thumbImage) }}
               />

               {/* Main Image (Fades in smoothly) */}
               <Image
                  style={[styles.image(imageSize.width, imageSize.height), { position: 'absolute' }]}
                  source={{ uri: image }}
               />
            </Animated.View>
         </GestureDetector>
      </View>
   );
}

ZoomableImage.propTypes = {
   image: PropTypes.string,
   thumbImage: PropTypes.string,
};

const styles = StyleSheet.create({
   root: screenBgColor => ({
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: screenBgColor,
   }),
   center: {
      justifyContent: 'center',
      alignItems: 'center',
   },
   image: (w, h) => ({
      width: w,
      height: h,
      borderRadius: 5,
   }),
});
