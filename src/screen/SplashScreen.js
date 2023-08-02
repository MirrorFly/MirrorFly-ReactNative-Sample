import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Image,
} from 'react-native';

const SplashScreen = () => {
  const logoOpacity = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/drawable_splash_gradient.png')}
        style={styles.imagebg}>
        <Image
          source={require('../assets/ic_logo_splash.png')}
          style={styles.logo}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#FFFFFF',
  },
  imagebg: {
    flex: 1,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
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
