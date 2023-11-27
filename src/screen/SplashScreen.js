import React from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
/**
 *
 *  ImageBackground,
  Image,
import splash_gradient from '../assets/drawable_splash_gradient.png';
import ic_logo_splash from '../assets/ic_logo_splash.png';
import { getImageSource } from '../common/utils';
*/
import ApplicationColors from '../config/appColors';

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
      <ActivityIndicator size={'large'} color={ApplicationColors.mainColor} />
      {/* <ImageBackground
        source={getImageSource(splash_gradient)}
        style={styles.imagebg}>
        <Image source={getImageSource(ic_logo_splash)} style={styles.logo} />
      </ImageBackground> */}
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
