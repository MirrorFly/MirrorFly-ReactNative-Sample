import React from 'react';
import { Animated } from 'react-native';

/**
 * @typedef ISlideProps
 * @prop {('top' | 'bottom')} slideFrom - slide from position. Default value is 'top'
 * @prop {number} offset - offset from top or bottom. Default value is 50
 * @prop {number} animationDuration - duration of the animation in milliseconds. Default value is 300
 */

/**
 * Slide from top or bottom with animation
 * @param {ISlideProps} props
 * @returns {React.JSX.Element}
 */
const Slide = ({
  slideFrom = 'top',
  offset = 50,
  animationDuration = 300,
  children,
}) => {
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(translateY, {
      duration: animationDuration,
      toValue: slideFrom === 'top' ? offset : -1 * offset,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const calculatedStyles = React.useMemo(() => {
    const _style = {
      position: 'absolute',
      width: '100%',
      zIndex: 100,
      transform: [{ translateY: translateY }],
    };
    if (slideFrom === 'top') {
      _style.bottom = '100%';
    } else {
      _style.top = '100%';
    }

    return _style;
  }, [translateY]);

  return <Animated.View style={calculatedStyles}>{children}</Animated.View>;
};

export default Slide;
