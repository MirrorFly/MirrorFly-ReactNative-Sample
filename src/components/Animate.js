import React from 'react';
import { View } from 'native-base';
import { Animated, Dimensions } from 'react-native';

const Animate = ({ children }) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const animatedStyle = {
        transform: [{ scale: scaleAnim }],
        width: screenWidth,
        height: screenHeight,
    };

    return (
        <View style={{ flex: 1 }}>
            <Animated.View style={[animatedStyle, { flex: 1 }]}>
                {children}
            </Animated.View>
        </View>
    );
};

export default Animate;