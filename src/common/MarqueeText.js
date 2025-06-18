import React from 'react';
import {
   Animated,
   Easing,
   findNodeHandle,
   NativeModules,
   PixelRatio,
   ScrollView,
   StyleSheet,
   View,
} from 'react-native';
import Text from './Text';
import PropTypes from 'prop-types';

const { UIManager } = NativeModules;

function wait(duration) {
   return new Promise(resolve => {
      setTimeout(resolve, duration);
   });
}

const createAnimation = (animatedValue, config, consecutive) => {
   const baseAnimation = Animated.timing(animatedValue, {
      easing: Easing.linear,
      useNativeDriver: true,
      ...config,
   });

   if (config.loop) {
      if (consecutive) {
         return Animated.sequence([
            baseAnimation,
            Animated.loop(
               Animated.sequence([
                  Animated.timing(animatedValue, {
                     toValue: consecutive.resetToValue,
                     duration: 0,
                     useNativeDriver: true,
                  }),
                  Animated.timing(animatedValue, {
                     easing: Easing.linear,
                     useNativeDriver: true,
                     ...config,
                     duration: consecutive.duration,
                  }),
               ]),
            ),
         ]);
      }
      return Animated.loop(Animated.sequence([baseAnimation, Animated.delay(1000)]));
   }

   return baseAnimation;
};

createAnimation.propTypes = {
   animatedValue: Animated.Value,
   config: PropTypes.shape({
      toValue: PropTypes.number,
      duration: PropTypes.number,
      loop: PropTypes.bool,
      speed: PropTypes.number,
      delay: PropTypes.number,
      consecutive: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
   }),
   consecutive: PropTypes.shape({
      resetToValue: PropTypes.number,
      duration: PropTypes.number,
   }),
};

const MarqueeText = (props, ref) => {
   const {
      style,
      marqueeOnStart = true,
      speed = 1,
      loop = true,
      delay = 0,
      consecutive = false,
      onMarqueeComplete,
      children,
      ...restProps
   } = props;

   const [isAnimating, setIsAnimating] = React.useState(false);

   const containerWidth = React.useRef(null);
   const marqueeTextWidth = React.useRef(null);
   const animatedValue = React.useRef(new Animated.Value(0));
   const textRef = React.useRef(null);
   const containerRef = React.useRef(null);
   const animation = React.useRef();
   const config = React.useRef({
      marqueeOnStart,
      speed,
      loop,
      delay,
      consecutive,
   });

   const stopAnimation = React.useCallback(() => {
      animation.current?.reset();
      setIsAnimating(false);
      invalidateMetrics();
   }, []);

   const startAnimation = React.useCallback(async () => {
      setIsAnimating(true);

      await wait(100);

      await calculateMetrics();

      if (!containerWidth.current || !marqueeTextWidth.current) {
         return;
      }

      const distance = marqueeTextWidth.current - containerWidth.current;
      if (distance < 0) {
         return;
      }

      const baseDuration = PixelRatio.getPixelSizeForLayoutSize(marqueeTextWidth.current) / config.current.speed;
      const { consecutive: isConsecutive } = config.current;
      animation.current = createAnimation(
         animatedValue.current,
         {
            ...config.current,
            toValue: isConsecutive ? -marqueeTextWidth.current : -distance,
            duration: isConsecutive ? baseDuration * (marqueeTextWidth.current / distance) : baseDuration,
         },
         isConsecutive
            ? {
                 resetToValue: containerWidth.current,
                 duration: baseDuration * ((containerWidth.current + marqueeTextWidth.current) / distance),
              }
            : undefined,
      );

      animation.current.start(() => {
         setIsAnimating(false);
         onMarqueeComplete?.();
      });
   }, [onMarqueeComplete]);

   React.useImperativeHandle(ref, () => {
      return {
         start: () => {
            startAnimation();
         },
         stop: () => {
            stopAnimation();
         },
      };
   });

   React.useEffect(() => {
      if (!config.current.marqueeOnStart) {
         return;
      }
      stopAnimation();
      startAnimation();
   }, [children, startAnimation, stopAnimation]);

   const calculateMetrics = async () => {
      try {
         if (!containerRef.current || !textRef.current) {
            return;
         }

         const [wrapperWidth, textWidth] = await Promise.all([
            measureComponentWidth(containerRef.current),
            measureComponentWidth(textRef.current),
         ]);

         containerWidth.current = wrapperWidth;
         marqueeTextWidth.current = textWidth;
      } catch (error) {
         console.warn(error);
      }
   };

   const measureComponentWidth = component => {
      return new Promise(resolve => {
         UIManager.measure(findNodeHandle(component), (x, y, w) => resolve(w));
      });
   };

   // Null distance is the special value to allow recalculation
   const invalidateMetrics = () => {
      containerWidth.current = null;
      marqueeTextWidth.current = null;
   };

   const { width, height } = StyleSheet.flatten(style || {});

   return (
      <View style={[styles.container, { width, height }]}>
         <Text
            numberOfLines={1}
            {...restProps}
            style={[
               style,
               {
                  opacity: isAnimating ? 0 : 1,
                  color: '#959595',
                  fontWeight: '700',
                  fontSize: 11,
               },
            ]}>
            {children}
         </Text>
         <ScrollView
            ref={containerRef}
            style={StyleSheet.absoluteFillObject}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            scrollEnabled={false}
            onContentSizeChange={calculateMetrics}>
            <Animated.Text
               ref={textRef}
               numberOfLines={1}
               {...restProps}
               style={[
                  style,
                  {
                     transform: [{ translateX: animatedValue.current }],
                     opacity: isAnimating ? 1 : 0,
                     width: '100%',
                     color: '#959595',
                     fontWeight: '700',
                     fontSize: 11,
                  },
               ]}>
               {children}
            </Animated.Text>
         </ScrollView>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      overflow: 'hidden',
   },
});

MarqueeText.propTypes = {
   style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
   marqueeOnStart: PropTypes.bool,
   speed: PropTypes.number,
   loop: PropTypes.bool,
   delay: PropTypes.number,
   consecutive: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
   onMarqueeComplete: PropTypes.func,
   children: PropTypes.node,
};

export default React.forwardRef(MarqueeText);
