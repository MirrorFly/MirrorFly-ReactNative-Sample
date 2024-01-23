import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const PulseAnimationComponent = ({
   color = 'blue',
   diameter = 400,
   duration = 1000,
   image = null,
   initialDiameter = 0,
   numPulses = 3,
   pulseStyle = {},
   speed = 10,
   style = {
      top: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
   },
}) => {
   const [state, setState] = React.useState({
      color,
      duration,
      image,
      maxDiameter: diameter,
      numPulses,
      pulses: [],
      pulseStyle,
      speed,
      started: false,
      style,
   });
   let mounted = false;

   const { numPulses: pulsesCount, duration: pulseDuration, speed: pulseSpeed, started } = state;
   mounted = true;

   const createPulse = pKey => {
      if (mounted) {
         setState(prevState => {
            const pulses = [...prevState.pulses];

            const pulse = {
               pulseKey: pulses.length + 1,
               diameter: initialDiameter,
               opacity: 0.5,
               centerOffset: (prevState.maxDiameter - initialDiameter) / 2,
            };

            pulses.push(pulse);

            return { ...prevState, pulses };
         });
      }
   };

   const updatePulse = () => {
      if (mounted) {
         setState(prevState => {
            const pulses = prevState.pulses.map((p, i) => {
               const maxDiameter = prevState.maxDiameter;
               const newDiameter = p.diameter > maxDiameter ? 0 : p.diameter + 2;
               const centerOffset = (maxDiameter - newDiameter) / 2;
               const opacity = Math.abs(newDiameter / prevState.maxDiameter - 1);

               const pulse = {
                  pulseKey: i + 1,
                  diameter: newDiameter,
                  opacity: opacity > 0.5 ? 0.5 : opacity,
                  centerOffset,
               };

               return pulse;
            });

            return { ...prevState, pulses };
         });
      }
   };

   React.useEffect(() => {
      let createPulseTimer;
      setState(prevState => ({ ...prevState, started: true }));
      let a = 0;
      while (a < pulsesCount) {
         createPulseTimer = setTimeout(() => {
            createPulse(a);
         }, a * pulseDuration);

         a++;
      }

      const timer = setInterval(() => {
         updatePulse();
      }, pulseSpeed);

      return () => {
         mounted = false;
         clearTimeout(createPulseTimer);
         clearInterval(timer);
      };
   }, []);

   const {
      color: pulseColor,
      image: pulseImage,
      maxDiameter,
      pulses,
      pulseStyle: pulseStyleProp,
      style: containerStyle,
   } = state;
   const pulseWrapperStyle = { width: maxDiameter, height: maxDiameter };

   return (
      <View style={[styles.container, containerStyle]}>
         {started && (
            <View style={pulseWrapperStyle}>
               {pulses.map(pulse => (
                  <View
                     key={pulse.pulseKey}
                     style={[
                        styles.pulse,
                        {
                           backgroundColor: pulseColor,
                           width: pulse.diameter,
                           height: pulse.diameter,
                           opacity: pulse.opacity,
                           borderRadius: pulse.diameter / 2,
                           top: pulse.centerOffset,
                           left: pulse.centerOffset,
                        },
                        pulseStyleProp,
                     ]}
                  />
               ))}
               {pulseImage && <Image style={pulseImage.style} source={pulseImage.source} />}
            </View>
         )}
      </View>
   );
};

export default PulseAnimationComponent;

const styles = StyleSheet.create({
   container: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
   },
   pulse: {
      position: 'absolute',
      flex: 1,
   },
});
