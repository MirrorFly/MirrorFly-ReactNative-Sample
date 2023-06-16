import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SplashScreen = () => {
    const logoOpacity = new Animated.Value(0);

    React.useEffect(() => {
        Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [])

    return (
        <View style={styles.container}>
            <Animated.Image
                style={{ ...styles.logo, opacity: logoOpacity }}
                source={require('../assets/mirrorfly-logo.png')}
            />
            {/* <Image source={require('../assets/mirrorfly-logo.png')} style={styles.logo} /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    logo: {
        width: 300,
        height: 350,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 20,
    },
});

export default SplashScreen;